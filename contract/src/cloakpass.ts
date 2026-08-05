// Pure-JavaScript synchronous SHA-256 implementation (zero dependencies, browser & node compatible)
export function sha256(ascii: string): string {
    function rightRotate(value: number, amount: number) {
        return (value >>> amount) | (value << (32 - amount));
    }
    
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = 'length';
    let i, j;

    let result = '';

    const words: any[] = [];
    const asciiLength = ascii[lengthProperty] * 8;
    
    const hash: any[] = [];
    const k: any[] = [];
    let primeCounter = 0;

    const isComposite: any = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = 1;
            }
            hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
        }
    }
    
    let tempAscii = ascii + '\x80';
    while (tempAscii[lengthProperty] % 64 - 56) {
        tempAscii += '\x00';
    }
    for (i = 0; i < tempAscii[lengthProperty]; i++) {
        j = tempAscii.charCodeAt(i);
        if (j >> 8) return ''; // ASCII check: only accept standard characters
        words[i >> 2] |= j << (24 - (i % 4) * 8);
    }
    words[words[lengthProperty]] = ((asciiLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiLength | 0);
    
    for (j = 0; j < words[lengthProperty]; j += 16) {
        const w = words.slice(j, j + 16);
        const oldHash = hash.slice(0);
        
        for (i = 0; i < 64; i++) {
            const w15 = w[i - 15], w2 = w[i - 2];
            
            const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
            const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
            w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;
            
            const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + 
                        ((hash[4] & hash[5]) ^ (~hash[4] & hash[6])) + 
                        k[i] + w[i]) | 0;
            const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + 
                        ((hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]))) | 0;
            
            hash.unshift((temp1 + temp2) | 0);
            hash[4] = (hash[4] + temp1) | 0;
            hash.length = 8;
        }
        
        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }
    
    for (i = 0; i < 8; i++) {
        let val = hash[i];
        if (val < 0) val += maxWord;
        result += val.toString(16).padStart(8, '0');
    }
    return result;
}

export function hashValues(inputs: string[]): string {
    return sha256(inputs.join(''));
}

// Emulates pad(32, string) in Compact
export function pad32(val: string): string {
    return val.padEnd(32, '\0');
}

export interface MerkleTreePathEntry {
    sibling: string;
    isRight: boolean;
}

export interface MerkleTreePath {
    leaf: string;
    path: MerkleTreePathEntry[];
}

// Simple Merkle Tree simulator of fixed depth (e.g. 4)
export class SimpleMerkleTree {
    public leaves: string[] = [];
    public depth: number;
    public defaultLeaf: string = '0000000000000000000000000000000000000000000000000000000000000000';

    constructor(depth: number = 4) {
        this.depth = depth;
        // Initialize with default empty leaves
        const totalLeaves = Math.pow(2, depth);
        for (let i = 0; i < totalLeaves; i++) {
            this.leaves.push(this.defaultLeaf);
        }
    }

    // Inserts a commitment into the next available leaf slot
    public insert(leaf: string): void {
        const index = this.leaves.findIndex(l => l === this.defaultLeaf);
        if (index === -1) {
            throw new Error('MerkleTree is full');
        }
        this.leaves[index] = leaf;
    }

    // Calculates the root of the tree
    public getRoot(): string {
        let currentLevel = [...this.leaves];
        while (currentLevel.length > 1) {
            const nextLevel: string[] = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = currentLevel[i + 1] || this.defaultLeaf;
                nextLevel.push(hashValues([left, right]));
            }
            currentLevel = nextLevel;
        }
        return currentLevel[0];
    }

    // Generates a path for a specific leaf index
    public getPath(index: number): MerkleTreePath {
        if (index < 0 || index >= this.leaves.length) {
            throw new Error('Index out of bounds');
        }
        const leaf = this.leaves[index];
        const path: MerkleTreePathEntry[] = [];
        let currentIndex = index;
        let currentLevel = [...this.leaves];

        while (currentLevel.length > 1) {
            const nextLevel: string[] = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = currentLevel[i + 1] || this.defaultLeaf;
                nextLevel.push(hashValues([left, right]));
            }

            const isRight = currentIndex % 2 === 1;
            const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;
            const sibling = currentLevel[siblingIndex] || this.defaultLeaf;
            path.push({ sibling, isRight });

            currentIndex = Math.floor(currentIndex / 2);
            currentLevel = nextLevel;
        }

        return { leaf, path };
    }

    // Verifies if a given path matches the root of the tree
    public verifyPath(path: MerkleTreePath, expectedRoot: string): boolean {
        let current = path.leaf;
        for (const entry of path.path) {
            if (entry.isRight) {
                current = hashValues([entry.sibling, current]);
            } else {
                current = hashValues([current, entry.sibling]);
            }
        }
        return current === expectedRoot;
    }
}

export interface CloakPassWitnesses {
    get_secret: () => string;
    get_membership_proof: () => MerkleTreePath;
    get_admin_secret: () => string;
}

// Simulated CloakPass Contract
export class CloakPassContract {
    // Ledger state
    public admin_pubkey: string;
    public commitments: SimpleMerkleTree;
    public access_granted_events: Map<string, boolean>;
    public access_granted_count: number;

    // Witness provider registered off-chain
    private witnesses!: CloakPassWitnesses;

    constructor(admin_pk: string) {
        this.admin_pubkey = admin_pk;
        this.commitments = new SimpleMerkleTree(4);
        this.access_granted_events = new Map<string, boolean>();
        this.access_granted_count = 0;
    }

    // Registers the off-chain witnesses for proof generation
    public registerWitnesses(witnesses: CloakPassWitnesses): void {
        this.witnesses = witnesses;
    }

    // Admin registers a member commitment
    public register_commitment(commitment: string): void {
        // 1. Authenticate admin using witness
        if (!this.witnesses || !this.witnesses.get_admin_secret) {
            throw new Error('Admin witness get_admin_secret is not registered');
        }
        const admin_sk = this.witnesses.get_admin_secret();
        const derived_admin_pk = hashValues([
            pad32('cloakpass:admin:v1'),
            admin_sk
        ]);

        if (derived_admin_pk !== this.admin_pubkey) {
            throw new Error('Unauthorized: Caller is not the admin');
        }

        // 2. Insert commitment leaf into commitments tree
        this.commitments.insert(commitment);
    }

    // User claims access anonymously by proving membership
    public prove_membership(event_id: string): void {
        // 1. Prevent replay attacks
        if (this.access_granted_events.has(event_id)) {
            throw new Error('Access already claimed for this event');
        }

        // 2. Retrieve private secret from witness
        if (!this.witnesses || !this.witnesses.get_secret) {
            throw new Error('Member witness get_secret is not registered');
        }
        const secret = this.witnesses.get_secret();

        // 3. Compute commitment
        const commitment = hashValues([
            pad32('cloakpass:commitment:v1'),
            secret
        ]);

        // 4. Retrieve membership proof path from witness
        if (!this.witnesses || !this.witnesses.get_membership_proof) {
            throw new Error('Member witness get_membership_proof is not registered');
        }
        const path = this.witnesses.get_membership_proof();

        // 5. Assert computed commitment matches path leaf
        if (path.leaf !== commitment) {
            throw new Error('Preimage does not match path leaf');
        }

        // 6. Verify Merkle root from the path
        const currentRoot = this.commitments.getRoot();
        const isValidProof = this.commitments.verifyPath(path, currentRoot);
        if (!isValidProof) {
            throw new Error('Invalid Merkle proof');
        }

        // 7. Update ledger state
        this.access_granted_events.set(event_id, true);
        this.access_granted_count += 1;
    }
}
