// Copyright 2024 justin
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Footer } from "../components/Footer"
import { MainHeader } from "../components/MainComponents/MainHeader"
export default function HowToBecomeOperator() {
    return (
        <>
            <MainHeader />
            <div className="bg-gray-50 min-h-screen py-12 px-6 sm:px-8">
                <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8 space-y-8">
                    {/* Title */}
                    <h1 className="text-4xl font-extrabold text-blue-600 text-center">
                        How to Run a Regular Node
                    </h1>

                    {/* What is a Node and Its Role */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            What is a Node and Its Role?
                        </h2>
                        <p className="text-gray-700 leading-relaxed ml-1">
                            In the hybrid <span className="font-medium">Commit-Reveal²</span>{" "}
                            protocol, nodes are participants that generate and reveal secrets to
                            securely contribute to random number generation. Regular nodes handle
                            off-chain commitments, reveals, and final secret disclosures, while the
                            leader node coordinates the process and interacts with the blockchain.
                        </p>
                        <p className="text-gray-700 leading-relaxed ml-1">
                            This hybrid model reduces on-chain operations, ensuring efficiency
                            while maintaining security and transparency through proofs and
                            verifiable smart contract interactions. Regular nodes also manage
                            deposits and adhere to protocol rules to uphold fairness and
                            correctness.
                        </p>
                    </section>

                    {/* Preparation Steps */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Preparations</h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-2">
                            <li>
                                <span className="font-medium">
                                    Add Thanos Sepolia on MetaMask:
                                </span>{" "}
                                Follow the guide here:{" "}
                                <a
                                    href="https://docs.tokamak.network/home/service-guide/tokamak-l2/thanos-testnet/add-thanos-sepolia-on-metamask"
                                    className="text-blue-500 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Add Thanos Sepolia on MetaMask
                                </a>
                            </li>
                            <li>
                                <span className="font-medium">Get TON from Faucet:</span> Request
                                Sepolia testnet tokens from the faucet:
                                <a
                                    href="https://sepolia.etherscan.io/address/0xd655762c601b9cac8f6644c4841e47e4734d0444#writeContract#F1"
                                    className="text-blue-500 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {" "}
                                    Go to Faucet
                                </a>
                                <p className="text-gray-700 ml-4">
                                    (Connect your testnet wallet and send a transaction by clicking
                                    on "requestTokens")
                                </p>
                            </li>
                            {/* <li className="ml-4"> */}
                            <div className="ml-4">
                                <p className="text-gray-700">Faucet will send you:</p>
                                <ul className="list-disc list-inside space-y-1 pl-4">
                                    <li>1200 TON</li>
                                    <li>100 USDC</li>
                                    <li>100 USDT</li>
                                </ul>
                            </div>
                            {/* </li> */}
                            <div className="text-gray-700 ml-4">
                                Faucet accepts one request{" "}
                                <span className="font-medium">every 24 hours</span> per account. If
                                you have leftover tokens or ETH, you can send it directly to the
                                Faucet contract.
                            </div>
                            <li>
                                <span className="font-medium">Deposit TON to Thanos Sepolia:</span>{" "}
                                Visit the bridge at{" "}
                                <a
                                    href="https://trh-op-bridge.vercel.app/bridge"
                                    className="text-blue-500 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    https://trh-op-bridge.vercel.app/bridge
                                </a>
                            </li>
                        </ul>
                    </section>

                    {/* Step 1 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Step 1: Project Link
                        </h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>
                                <span className="font-medium">Github URL:</span>{" "}
                                <a
                                    href="https://github.com/tokamak-network/DRB-node"
                                    className="text-blue-500 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    DRB Node Repository
                                </a>
                            </li>
                            <li>
                                <span className="font-medium">Branch:</span>{" "}
                                <code className="bg-gray-200 px-2 py-1 rounded text-sm">
                                    libp2p-communication
                                </code>
                            </li>
                            <li>
                                <span className="font-medium">Commit Hash:</span>{" "}
                                <code className="bg-gray-200 px-2 py-1 rounded text-sm">
                                    fc35ab415b0f6294113fb84f847061561f23403e
                                </code>
                            </li>
                        </ul>
                    </section>

                    {/* Step 2 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Step 2: Ensure Sufficient Wallet Balance
                        </h2>
                        <p className="text-gray-700">
                            Make sure your wallet has enough balance to operate the node
                            effectively. You may need some <span className="font-medium">TON</span>{" "}
                            for gas fees and other transactions.
                        </p>
                    </section>

                    {/* Step 3 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Step 3: Set Up the .env Variables
                        </h2>
                        <p className="text-gray-700">
                            First, create a <code>.env</code> file in your project directory. This
                            file will contain the necessary environment variables to connect to the
                            network and run the node.
                            {"\n"}
                            Here are the variables you'll need to set:
                        </p>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
                            LEADER_IP=13.49.228.201 # IP address of the leader node{"\n"}
                            LEADER_PORT=61280 # Port for the leader node{"\n"}
                            LEADER_PEER_ID=12D3KooWG5QNHzBv2BghpZ4ZGDa9pHWKzEHi6bEsE5kMCsnR2XSZ #
                            Peer ID of the leader node{"\n"}
                            LEADER_EOA=0x1723C153e86D589ce1c7478295bba783a2df9dd7 # Ethereum
                            address (EOA) of the leader node{"\n"}
                            {"\n"}
                            PEER_ID=regularNode # Your node's peer ID (this can be any unique name)
                            {"\n"}
                            EOA_PRIVATE_KEY=your_private_key # Your Ethereum private key for
                            signing transactions{"\n"}
                            PORT=61281 # Port for your regular node{"\n"}
                            NODE_TYPE=regular # Node type, should be set to "regular"{"\n"}
                            {"\n"}
                            CHAIN_ID=111551119090 # Chain ID for the network{"\n"}
                            ETH_RPC_URL=https://rpc.thanos-sepolia.tokamak.network # URL for
                            Ethereum RPC{"\n"}
                            CONTRACT_ADDRESS=0x7d12f3421E6ae1D2668Ed10C25873aF3B1b7449f # Address
                            of the smart contract{"\n"}
                            SUBGRAPH_URL=https://graph-node.thanos-sepolia.tokamak.network/subgraphs/name/commitreveal2
                            # Subgraph URL for data queries{"\n"}
                        </pre>
                    </section>

                    {/* Leader Node Details */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Leader Node Details
                        </h2>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                            <li>
                                <span className="font-medium">IP:</span> <code>13.49.228.201</code>
                            </li>
                            <li>
                                <span className="font-medium">Port:</span> <code>61280</code>
                            </li>
                            <li>
                                <span className="font-medium">Peer ID:</span>{" "}
                                <code>12D3KooWG5QNHzBv2BghpZ4ZGDa9pHWKzEHi6bEsE5kMCsnR2XSZ</code>
                            </li>
                            <li>
                                <span className="font-medium">Wallet Address:</span>{" "}
                                <code>0x1723C153e86D589ce1c7478295bba783a2df9dd7</code>
                            </li>
                        </ul>
                        <p className="text-gray-700">
                            These details are required for connecting your regular node to the
                            leader node.
                        </p>
                    </section>

                    {/* Step 4 */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Step 4: Running the Node
                        </h2>
                        <p className="text-gray-700">
                            Once you have set the necessary environment variables, you can run the
                            node in two ways:
                        </p>
                        <h3 className="text-xl font-medium text-gray-700">
                            Option 1: Run Directly with Go
                        </h3>
                        <p className="text-gray-700">
                            You can run the node directly using the go command:
                        </p>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
                            go cmd/main.go
                        </pre>

                        <h3 className="text-xl font-medium text-gray-700">
                            Option 2: Run with Docker
                        </h3>
                        <p className="text-gray-700">
                            Alternatively, you can use Docker to run the node. To do so, update the
                            container name and ports in the <code>docker-compose.yml</code> file:
                        </p>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
                            ports:{"\n    "}- "61280:61280" # Adjust this as per your choice
                        </pre>
                        <p className="text-gray-700">Then, build and start the container:</p>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
                            docker-compose up --build
                        </pre>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    )
}
