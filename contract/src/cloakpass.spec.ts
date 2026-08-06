import { describe, it, expect, beforeEach } from 'vitest';
import { CloakPassContract, SimpleMerkleTree, hashValues, pad32 } from './cloakpass.js';

describe('CloakPass Contract & Circuit Unit Tests', () => {
    const ADMIN_SK = 'admin-super-secret-key-12345';
    const ADMIN_PK = hashValues([pad32('cloakpass:admin:v1'), ADMIN_SK]);

    let contract: CloakPassContract;

    beforeEach(() => {
        contract = new CloakPassContract(ADMIN_PK);
    });

    // TEST D: Admin registration authentication check
    it('should allow the admin to register a new member commitment with correct secret', () => {
        const memberSecret = 'member-key-1';
        const commitment = hashValues([pad32('cloakpass:commitment:v1'), memberSecret]);

        // Register admin witness
        contract.registerWitnesses({
            get_admin_secret: () => ADMIN_SK,
            get_secret: () => '',
            get_membership_proof: () => ({ leaf: '', path: [] })
        });

        expect(() => contract.register_commitment(commitment)).not.toThrow();
        expect(contract.commitments.leaves[0]).toBe(commitment);
    });

    // TEST E: Unauthorized admin registration check
    it('should prevent unauthorized addresses from registering commitments', () => {
        const commitment = hashValues([pad32('cloakpass:commitment:v1'), 'member-key-1']);

        // Register attacker witness
        contract.registerWitnesses({
            get_admin_secret: () => 'malicious-admin-secret',
            get_secret: () => '',
            get_membership_proof: () => ({ leaf: '', path: [] })
        });

        expect(() => contract.register_commitment(commitment)).toThrow('Unauthorized: Caller is not the admin');
    });

    // TEST A: Valid member secret successfully generates proof and grants access
    it('should successfully grant access to a valid member providing correct secret & Merkle path', () => {
        const secrets = ['secret-a', 'secret-b', 'secret-c'];
        const commitments = secrets.map(s => hashValues([pad32('cloakpass:commitment:v1'), s]));

        // Admin registers members
        contract.registerWitnesses({
            get_admin_secret: () => ADMIN_SK,
            get_secret: () => '',
            get_membership_proof: () => ({ leaf: '', path: [] })
        });

        commitments.forEach(c => contract.register_commitment(c));

        // Member B wants to prove membership (index 1)
        const memberBIndex = 1;
        const memberBSecret = secrets[memberBIndex];
        const memberBCommitment = commitments[memberBIndex];
        const path = contract.commitments.getPath(memberBIndex);

        // Register member B witness
        contract.registerWitnesses({
            get_admin_secret: () => '',
            get_secret: () => memberBSecret,
            get_membership_proof: () => path
        });

        // Claim access
        const eventId = hashValues(['event-nonce-123']);
        expect(() => contract.prove_membership(eventId)).not.toThrow();
        expect(contract.access_granted_events.get(eventId)).toBe(true);
        expect(contract.access_granted_count).toBe(1);
    });

    // TEST B: Invalid/non-member secret fails verification
    it('should reject proof verification when an invalid member secret is supplied', () => {
        const secrets = ['secret-a', 'secret-b'];
        const commitments = secrets.map(s => hashValues([pad32('cloakpass:commitment:v1'), s]));

        // Admin registers members
        contract.registerWitnesses({
            get_admin_secret: () => ADMIN_SK,
            get_secret: () => '',
            get_membership_proof: () => ({ leaf: '', path: [] })
        });
        commitments.forEach(c => contract.register_commitment(c));

        // Malicious non-member tries to use Member A's Merkle path but with their own secret
        const path = contract.commitments.getPath(0); // Member A's path
        const attackerSecret = 'attacker-secret';

        contract.registerWitnesses({
            get_admin_secret: () => '',
            get_secret: () => attackerSecret,
            get_membership_proof: () => path
        });

        const eventId = hashValues(['event-nonce-456']);
        expect(() => contract.prove_membership(eventId)).toThrow('Preimage does not match path leaf');
        expect(contract.access_granted_events.has(eventId)).toBe(false);
    });

    // TEST C: Assert that member commitments/identities are never exposed in public ledger state
    it('should guarantee that private member secrets and identities are never exposed in public ledger state', () => {
        const secret = 'highly-sensitive-secret-token';
        const commitment = hashValues([pad32('cloakpass:commitment:v1'), secret]);

        contract.registerWitnesses({
            get_admin_secret: () => ADMIN_SK,
            get_secret: () => '',
            get_membership_proof: () => ({ leaf: '', path: [] })
        });
        contract.register_commitment(commitment);

        const path = contract.commitments.getPath(0);
        contract.registerWitnesses({
            get_admin_secret: () => '',
            get_secret: () => secret,
            get_membership_proof: () => path
        });

        const eventId = hashValues(['session-cookie']);
        contract.prove_membership(eventId);

        // Inspect public state
        const publicStateString = JSON.stringify({
            admin_pubkey: contract.admin_pubkey,
            commitments: contract.commitments.leaves,
            access_granted_events: Array.from(contract.access_granted_events.entries()),
            access_granted_count: contract.access_granted_count
        });

        // The public state must NOT contain the sensitive secret or its substring
        expect(publicStateString).not.toContain(secret);
        // The public state only contains the derived commitment hash and the event nonce hash
        expect(publicStateString).toContain(commitment);
        expect(publicStateString).toContain(eventId);
    });

    // TEST F: Replay attack prevention
    it('should prevent replay attacks using the same event ID', () => {
        const secret = 'secret-member-x';
        const commitment = hashValues([pad32('cloakpass:commitment:v1'), secret]);

        // Admin registers commitment
        contract.registerWitnesses({
            get_admin_secret: () => ADMIN_SK,
            get_secret: () => '',
            get_membership_proof: () => ({ leaf: '', path: [] })
        });
        contract.register_commitment(commitment);

        const path = contract.commitments.getPath(0);
        contract.registerWitnesses({
            get_admin_secret: () => '',
            get_secret: () => secret,
            get_membership_proof: () => path
        });

        const eventId = hashValues(['event-nonce-789']);
        // First claim succeeds
        expect(() => contract.prove_membership(eventId)).not.toThrow();

        // Second claim with same eventId fails
        expect(() => contract.prove_membership(eventId)).toThrow('Access already claimed for this event');
    });

    // TEST G: Merkle tree capacity checks
    it('should throw an error if inserting more commitments than the Merkle tree depth allows (16 leaves)', () => {
        contract.registerWitnesses({
            get_admin_secret: () => ADMIN_SK,
            get_secret: () => '',
            get_membership_proof: () => ({ leaf: '', path: [] })
        });

        // Insert 16 commitments
        for (let i = 0; i < 16; i++) {
            const leaf = hashValues([pad32('cloakpass:commitment:v1'), `member-secret-${i}`]);
            contract.register_commitment(leaf);
        }

        // 17th insertion should fail
        const extraLeaf = hashValues([pad32('cloakpass:commitment:v1'), 'member-secret-17']);
        expect(() => contract.register_commitment(extraLeaf)).toThrow('MerkleTree is full');
    });

    // TEST H: Path validation check
    it('should reject proof verification if Merkle path entries are manipulated', () => {
        const secret = 'member-y';
        const commitment = hashValues([pad32('cloakpass:commitment:v1'), secret]);

        contract.registerWitnesses({
            get_admin_secret: () => ADMIN_SK,
            get_secret: () => '',
            get_membership_proof: () => ({ leaf: '', path: [] })
        });
        contract.register_commitment(commitment);

        const path = contract.commitments.getPath(0);
        
        // Manipulate path entry
        path.path[0].sibling = hashValues(['tampered-sibling']);

        contract.registerWitnesses({
            get_admin_secret: () => '',
            get_secret: () => secret,
            get_membership_proof: () => path
        });

        const eventId = hashValues(['session-111']);
        expect(() => contract.prove_membership(eventId)).toThrow('Invalid Merkle proof');
    });
});
