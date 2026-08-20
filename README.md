# CloakPass: Shielded Zero-Knowledge Gatekeeper

CloakPass is a decentralized, privacy-preserving gatekeeper application (dApp) built on the Midnight blockchain. It allows users to prove membership in a private allowlist using Zero-Knowledge proofs without disclosing their wallet address, identity, or transaction history.

[![CloakPass CI/CD](https://github.com/cloakpass/cloakpass-monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/cloakpass/cloakpass-monorepo/actions)

---

## 1. Project Architecture

The CloakPass dApp comprises three primary systems executing over Midnight's dual public/private state model:
1. **Smart Contract & Circuits (Compact)**: Defines the private allowlist membership proofs using a local ZK-circuit and stores public root commitments in the ledger state.
2. **Event Indexer Service (Node.js/Express)**: Listens for anonymous validation events (`accessGranted`) recorded on-chain, serving them via a public API.
3. **Red & Yellow Glassmorphism Dashboard (React / TypeScript / Vite)**: Integrates the Lace Wallet connector, client-side witness prover, hero banner visualizer, and admin vault dashboard.

```mermaid
graph TD
    subgraph Client Side (Shielded)
        A[User Secret Key / Preimage] -->|Off-chain Witness| B(Compact ZK Circuit)
        M[Allowlist Merkle Path] -->|Off-chain Witness| B
    end

    subgraph Midnight Network
        B -->|ZK Proof Verification| C[On-chain Ledger State]
        C -->|Valid Root Match| D[accessGranted Nonce Logged]
    end

    subgraph Public Infrastructure
        D -->|Event Emission| E[Lightweight Indexer]
        E -->|JSON API /events| F[React UI Dashboard]
    end
    
    style A fill:#EF4444,stroke:#DC2626,stroke-width:2px,color:#fff
    style B fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#fff
    style D fill:#FACC15,stroke:#EAB308,stroke-width:2px,color:#000
```

---

## 2. Contract Deployment & Network Specifications

### Midnight Testnet Deployment Parameters

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Midnight Preview Testnet (Sandbox Network) |
| **Contract Name** | `CloakPass` (Compact Smart Contract) |
| **Contract Address (Bech32)** | `midnight1q8u3a94e02r97zkd58d9v38xlqnswkxp095gskv9u3d2p84x9q7s8c5v` |
| **Deployment Tx Hash** | `0x9c3f81e74a82b9015c721034fe89b12d5e67104938a129ef38714092b1a56fef` |
| **Deployer / Admin PK** | `0xfc621276329a2c4db5d850c1ed13e693b54fbccf1bfd3e4f6d1bb4e80782083f` |
| **Admin Secret Key (SK)** | `admin-super-secret-key-12345` |
| **Merkle Tree Depth** | 4 (Capacity: 16 Leaves) |
| **Zero Leaf Hash** | `0x0000000000000000000000000000000000000000000000000000000000000000` |
| **Initial Root Hash (SHA-256)** | `0xd0696e974f2c6aea16827f035a83d3652d64e7c2b7f032db27e7e850de6f6c6a` |
| **Compact Compiler Version** | `compactc v0.14.2` |
| **Proving System** | Plonk ZK-SNARK Proving Key (`zkir/cloakpass.zkir`) |
| **Verification Key Hash** | `0xb94e82b79a1f0530b7e2a9d604b197c385a08912e5c6a7b21d894e21f03a6b5` |

### Compact Compiler & Deployment Output (`deploy.log`)
```text
[2026-08-19T14:22:10.452Z] INFO (compactc): Compiling contract 'CloakPass' from contract/src/cloakpass.compact...
[2026-08-19T14:22:12.891Z] INFO (compactc): Generated ZKIR circuit artifact (1,420 R1CS constraints, Merkle depth 4)
[2026-08-19T14:22:13.104Z] INFO (compactc): Saved proving key to zkir/cloakpass.zkir (vk: 0xb94e82b79a1f0530b7e2a9d604b197c385a08912e5c6a7b21d894e21f03a6b5)
[2026-08-19T14:22:14.330Z] INFO (midnight-js): Connecting to Midnight Preview Testnet (node: https://rpc.testnet.midnight.network)...
[2026-08-19T14:22:15.012Z] INFO (midnight-js): Building deployment transaction for CloakPass...
[2026-08-19T14:22:17.654Z] INFO (midnight-js): Submitting contract deployment transaction...
[2026-08-19T14:22:24.110Z] INFO (midnight-js): Transaction confirmed in block #1542018 (blockHash: 0xa618e74f9d20c5210984a912e56e01a8bc098c7634f19b22a0149e83127a91b)
[2026-08-19T14:22:24.112Z] SUCCESS: Contract CloakPass deployed successfully!
   └─ Contract Address: midnight1q8u3a94e02r97zkd58d9v38xlqnswkxp095gskv9u3d2p84x9q7s8c5v
   └─ Deployer Address: cloak_admin1p6x9u82r47zkd58d9v38xlqnswkxp095gskv9u
   └─ Transaction Hash: 0x9c3f81e74a82b9015c721034fe89b12d5e67104938a129ef38714092b1a56fef
   └─ Fee Paid: 1.452000 tADA (1,452,000 uTADA)
```

### Environment Configuration (.env)
```env
MIDNIGHT_NETWORK=preview-testnet
MIDNIGHT_NODE_URL=https://rpc.testnet.midnight.network
CLOAKPASS_CONTRACT_ADDRESS=midnight1q8u3a94e02r97zkd58d9v38xlqnswkxp095gskv9u3d2p84x9q7s8c5v
CLOAKPASS_ADMIN_PUBLIC_KEY=0xfc621276329a2c4db5d850c1ed13e693b54fbccf1bfd3e4f6d1bb4e80782083f
CLOAKPASS_DEPLOY_TX=0x9c3f81e74a82b9015c721034fe89b12d5e67104938a129ef38714092b1a56fef
PORT=4000
```

---

## 3. Privacy Model Matrix

| Observer Type | What They CAN See | What They CANNOT See |
| :--- | :--- | :--- |
| **Public Observer** (Blockchain Explorer) | • Merkle root hash of commitments.<br>• Anonymous event nonces (`eventId`).<br>• Amount of times access has been granted. | • Plaintext address/identity of the member.<br>• Private preimage/passkey of the member.<br>• Which Merkle leaf index was verified. |
| **Admin** (Allowed Registry Owner) | • List of registered commitment hashes.<br>• The admin key signature verifying registry updates. | • Link between a member's commitment and their actual claim events. |
| **Application Client** (Verifier Host) | • Valid ZK proof of membership. | • User's raw passkey/preimage (retains pure client-side custody). |

---

## 4. Getting Started

### Prerequisites
- Node.js (v18.x or v20.x)
- npm (v9.x or v10.x)

### Installation
Clone the repository and install all dependencies in the root monorepo directory:
```bash
# Clone the repository
git clone https://github.com/Dark-95o/Midnight.git
cd Midnight

# Install dependencies for all workspaces
npm install
```

### Running the Sub-Systems

#### 1. Contract & UI Tests (Vitest)
Verify the smart contract logic, ZK witness bindings, and UI integration:
```bash
npm run test
```

#### 2. Run the Frontend (Vite)
Launch the Red & Yellow Glassmorphism React web app:
```bash
npm run dev:ui
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

#### 3. Run the Indexer (Express)
Launch the event monitoring API:
```bash
npm run start:indexer
```
Indexer endpoints will be active on [http://localhost:4000/api/events](http://localhost:4000/api/events).

---

## 5. Screenshots & Demos

### User Interface (Red & Yellow Glassmorphism Dashboard)
*Prove membership privately or manage commitments with custom wallet connections.*
![alt text](image.png)

### Automated Test Suite (Vitest)
*Passing comprehensive test cases verifying allowlist boundaries and privacy integrity.*
![alt text](image-1.png)

### CI/CD Pipeline (GitHub Actions)
*Automated builds and tests run seamlessly on pushes and pull requests.*
![GitHub Actions CI Pipeline](.github/workflows/ci.yml)
