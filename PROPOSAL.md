# CloakPass: Shielded Zero-Knowledge Gatekeeper (Proposal)

**Track / Submission Title**: CloakPass — Level 3 Gatekeeper  
**Concept**: Decentralized allowed-member proving system with zero transaction linking and total anonymity.

---

## 1. Problem Statement
Many decentralized applications, private DAOs, and premium service providers require token gating or allowlist validation. However, traditional blockchain verification methods (e.g., EVM token-gating) require users to connect their wallets and sign a message. 

This creates three critical privacy vulnerabilities:
1. **Identity Leakage**: The validator (and anyone inspecting the public ledger) links the user's IP/session to their public key.
2. **Transaction Association**: If a user validates their wallet across multiple services, those services can link their actions, building an invasive profile.
3. **Targeted Exploits**: Storing public addresses of allowed members on-chain makes those users targets for phishing and wallet draining.

---

## 2. The Zero-Knowledge Solution
CloakPass solves this by decoupling allowlist eligibility from user identity. 

- **Shielded Registration**: The administrator hashes each member's private passkey off-chain to generate a unique commitment. This commitment is inserted as a leaf in an on-chain Merkle tree.
- **Anonymous Proving**: When a user claims access, they construct a ZK proof proving they know a preimage/passkey that hashes to a leaf in the public Merkle tree.
- **Ledger Verification**: The Midnight node verifies the proof against the public root. If valid, it logs a unique, one-time `eventId` (nonce) on the ledger to prevent double-claiming, without disclosing which member asserted the claim.

---

## 3. Technology Comparison: Midnight vs. EVM

| Feature | Midnight Network (CloakPass) | EVM (Standard Token-Gating) |
| :--- | :--- | :--- |
| **State Execution Model** | **Dual State**: Calculations occur in private client-side witnesses, outputting only public proof outputs. | **Transparent State**: All operations and parameters are evaluated publicly on every node. |
| **Identity Disclosure** | **Zero Disclosure**: Wallet address is never submitted or associated with access events. | **Full Linkage**: Address is exposed, signing transactions are published and traceably linked to the caller. |
| **Double-Claim Prevention** | **One-time Nonces / Nullifiers**: Unique hashes prevent replay without revealing identity details. | **Address Mapping**: Checked via `mapping(address => bool)`, revealing the exact account that claimed. |
| **User Safety** | **Immune to targeted attacks**: Users are shielded and cannot be profiled or targeted. | **Vulnerable**: On-chain list of holders creates honeypots for exploiters. |

---

## 4. 1-Minute Demo Video Script Outline

*   **[0:00 - 0:10] Hook & Problem**:  
    *"Token gating on EVM is broken. Every time you verify your wallet to access a DAO, you link your real-world identity to your public balance, creating a massive target for hackers. How do we prove we belong without revealing who we are?"*
*   **[0:10 - 0:25] Introducing CloakPass**:  
    *"Meet CloakPass. A zero-knowledge gatekeeper built on the Midnight blockchain. It allows users to prove membership in a secure allowlist without disclosing their wallet address, assets, or identity."*
*   **[0:25 - 0:45] Screen Recording Walkthrough**:  
    *"On the Admin dashboard, we register a member using a shielded commitment. The member's plain credentials never touch the blockchain. When the member signs in, our Compact circuit generates a ZK proof locally. The public ledger records only a single anonymous access event. Notice the visual boundary card displaying: Identity: REDACTED."*
*   **[0:45 - 1:00] Call to Action**:  
    *"CloakPass guarantees zero identity leakage or transaction linking. Built for hackathons and designed for the future of private web3. CloakPass: Enter securely, stay anonymous."*
