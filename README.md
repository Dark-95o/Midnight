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

| Parameter | Specification / Value |
| :--- | :--- |
| **Network Name** | Midnight Preview Testnet (Sandbox Environment) |
| **Contract Name** | `CloakPass` (Compact Smart Contract) |
| **Contract Address (Placeholder)** | `midnight1q5a34e02r97zkd58d9v38xlqnswkxp095gskv9u3d2p84x9q` |
| **Deployer / Admin PK** | `0x7a91bf540d998246e7f864e21a8d052a9261a8bc098c7634f19b22a0149e8312` |
| **Merkle Tree Depth** | 4 (Capacity: 16 Leaves) |
| **Zero Leaf Value** | `0x0000000000000000000000000000000000000000000000000000000000000000` |
| **Compact Circuit Compiler** | `compactc v0.14.2` |
| **Proving System** | Plonk ZK-SNARK Proving Key (`zkir/cloakpass.zkir`) |
| **Verification Key Hash** | `0x4e82b79a1f0530b7e2a9d604b197c385a08912e5c6a7b21d894e21f03a6b579c` |

### Environment Configuration (.env)
```env
MIDNIGHT_NETWORK=testnet
MIDNIGHT_NODE_URL=https://indexer.testnet.midnight.network
CLOAKPASS_CONTRACT_ADDRESS=midnight1q5a34e02r97zkd58d9v38xlqnswkxp095gskv9u3d2p84x9q
CLOAKPASS_ADMIN_PUBLIC_KEY=0x7a91bf540d998246e7f864e21a8d052a9261a8bc098c7634f19b22a0149e8312
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
