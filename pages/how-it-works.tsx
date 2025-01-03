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
import Image from "next/image"
import { Footer } from "../components/Footer"
import { MainHeader } from "../components/MainComponents/MainHeader"
const imageLoader = ({ src, width, quality }: any) => {
    return `../../background.jpg`
}
export default function HowItWorks() {
    return (
        <>
            <MainHeader />
            <div className="bg-gray-50 min-h-screen py-12 px-6 sm:px-8">
                <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8 space-y-8">
                    {/* Main Title */}
                    <header className="text-center">
                        <h1 className="text-4xl font-extrabold text-blue-600">How It Works</h1>
                    </header>

                    {/* Subtitle */}
                    <section className="space-y-2">
                        <p className="text-3xl font-bold text-gray-800">Commit-Reveal² Protocol</p>
                    </section>

                    {/* Overview */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Overview</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Commit-Reveal² is a randomness generation protocol designed for
                            blockchain systems. It addresses key challenges in secure and fair
                            randomness generation by introducing a layered Commit-Reveal² structure
                            combined with a hybrid on-chain/off-chain approach. This protocol not
                            only enhances fairness and security but also achieves significant cost
                            reductions, making it ideal for decentralized applications such as
                            validator selection, lotteries, and resource allocation.
                        </p>
                    </section>

                    {/* Problem to Solve */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Problem to Solve</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Existing randomness generation methods often face two critical issues:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2">
                            <li>
                                <span className="font-medium">Last Revealer Attack:</span> The
                                final participant in a Commit-Reveal protocol can choose to reveal
                                or withhold their secret, manipulating the random output to their
                                advantage.
                            </li>
                            <li>
                                <span className="font-medium">High On-Chain Costs:</span> Purely
                                on-chain solutions incur substantial gas costs, limiting
                                scalability and practicality for decentralized systems.
                            </li>
                        </ul>
                    </section>

                    {/* Core Mechanism */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Core Mechanism</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Commit-Reveal² tackles these problems through a commit-reveal² process
                            and a hybrid model:
                        </p>
                        <ul className="list-disc list-inside text-gray-700 space-y-2">
                            <li>
                                <span className="font-medium">Randomized Reveal Order:</span>{" "}
                                Commit-Reveal² uses the commitments to determine the sequence for
                                secret revelations in the second round. This randomization
                                minimizes the impact of the last revealer attack, ensuring fairness
                                and unpredictability.
                            </li>
                            <li>
                                <span className="font-medium">Hybrid Design:</span> Storage-heavy
                                operations, such as storing commits and reveal orders, are handled
                                off-chain by participants and the leader node. Only critical
                                operations, such as verifications, occur on-chain, significantly
                                reducing gas usage while maintaining transparency.
                            </li>
                            <li>
                                <span className="font-medium">Security:</span> The protocol binds
                                each participant’s secret to commitments (co
                                <sub>i</sub> and cv<sub>i</sub>), ensuring integrity and preventing
                                manipulation. Randomness is generated by securely combining these
                                secrets in the verified order.
                            </li>
                        </ul>
                    </section>

                    {/* Flow Section */}
                    <section className="space-y-8">
                        <h2 className="text-3xl font-semibold text-gray-800">
                            Protocol Flow Description
                        </h2>

                        {/* Flow Image */}
                        <div className="flex justify-center">
                            <img
                                src="diagram.png" // Replace with the correct path to your image
                                alt="Commit-Reveal² Protocol Flow"
                                className="rounded-lg shadow-md max-w-full h-auto"
                            />
                            <Image
                                className="rounded-lg shadow-md max-w-full h-auto"
                                src="../diagram.png"
                                loader={imageLoader}
                                alt=""
                                width={900}
                                height={400}
                                priority
                                unoptimized
                            />
                        </div>

                        {/* Flow Description */}
                        <div className="text-gray-700 leading-relaxed space-y-4">
                            <p>
                                The Commit-Reveal² protocol is designed with three distinct phases—
                                <strong>Commit</strong>, <strong>Reveal-1</strong>, and{" "}
                                <strong>Reveal-2</strong>—to securely and verifiably generate
                                random numbers while minimizing the risk of manipulation, such as
                                the <em>last revealer attack</em>. The hybrid model leverages
                                off-chain computations to optimize gas costs while maintaining
                                cryptographic integrity and transparency.
                            </p>

                            <h3 className="text-2xl font-semibold text-gray-800">Commit Phase</h3>
                            <p>
                                In this phase, participating nodes generate a secret and compute
                                commitment values:{" "}
                                <code>
                                    co<sub>i</sub>
                                </code>{" "}
                                and{" "}
                                <code>
                                    cv<sub>i</sub>
                                </code>
                                . These commitments are sent to the leader node, which verifies and
                                constructs a Merkle Root, storing it on-chain.
                            </p>

                            <h3 className="text-2xl font-semibold text-gray-800">
                                Reveal-1 Phase
                            </h3>
                            <p>
                                Nodes partially reveal their commitments by broadcasting{" "}
                                <code>
                                    co<sub>i</sub>
                                </code>{" "}
                                values off-chain. The leader node validates these partial reveals
                                and determines the order in which nodes will reveal their full
                                secrets in the next phase.
                            </p>

                            <h3 className="text-2xl font-semibold text-gray-800">
                                Reveal-2 Phase
                            </h3>
                            <p>
                                Nodes reveal their secrets in the pre-determined reveal order. The
                                leader node verifies the revealed secrets and combines these
                                secrets in the reveal order to generate the final random number.
                                This ensures fairness and transparency in the random number
                                generation process.
                            </p>
                        </div>
                    </section>

                    {/* Manuscript for Details */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Manuscript for Details
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Dive deeper into the protocol, its implementation, and its benefits:
                        </p>
                        <a
                            href="https://mocklink-to-commit-reveal2-manuscript.com/"
                            className="inline-block text-blue-500 hover:underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Commit-Reveal² Protocol Manuscript →
                        </a>
                        <p className="text-gray-700 leading-relaxed">
                            By combining cryptographic rigor with an efficient hybrid design,
                            Commit-Reveal² offers a scalable, cost-effective solution for
                            blockchain-based randomness generation.
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    )
}
