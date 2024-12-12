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
import { Loading, Modal } from "web3uikit"

export interface SubgraphData {
    round: string
    merkleRootSubmitted: MerkleRootSubmitted
    randomNumberGenerated: RandomNumberGenerated
    randomNumberRequested: RandomNumberRequested
}

interface MerkleRootSubmitted {
    merkleRoot: string
    transactionHash: string
}

interface RandomNumberGenerated {
    participatedOperators: string[]
    randomNumber: string
    transactionHash: string
}

interface RandomNumberRequested {
    transactionHash: string
}
export const DetailModal = ({
    isVisible,
    onClose,
    subgraphData,
    loading,
}: {
    isVisible: boolean
    onClose: () => void
    subgraphData: SubgraphData | null
    loading: boolean
}) => {
    // console.log("subgraphData", subgraphData)
    // console.log("loading", loading)
    // console.log("isVisible", isVisible)
    const explorerUrl = "https://explorer.thanos-sepolia.tokamak.network/tx/"
    return (
        <>
            <Modal
                isVisible={isVisible}
                id="v-center"
                onCancel={onClose}
                onCloseButtonPressed={onClose}
                onOk={onClose}
                isCentered
                title={
                    <div className="text-2xl font-bold text-blue-800 tracking-wide pt-2">
                        {subgraphData ? `Request ID: ${subgraphData.round}` : "Details"}
                    </div>
                }
                hasCancel={false}
                hasFooter={true}
                width="65vw"
            >
                <div className="pt-5 pb-10">
                    {loading ? (
                        <div className="bg-blue-50 rounded-lg p-6">
                            <Loading
                                fontSize={16}
                                size={16}
                                spinnerColor="#2E7DAF"
                                spinnerType="wave"
                                text="Loading..."
                            />
                        </div>
                    ) : !subgraphData ? (
                        <div className="text-center text-gray-500">No data found</div>
                    ) : (
                        <div className="space-y-8">
                            {/* Random Number Requested */}
                            <div className="bg-white shadow-lg p-5 rounded-lg border border-gray-200">
                                <h3 className="text-xl font-semibold text-blue-700">
                                    Random Number Requested
                                </h3>
                                {subgraphData.randomNumberRequested ? (
                                    <p className="text-base text-gray-700 mt-2">
                                        Transaction:{" "}
                                        <a
                                            href={`${explorerUrl}${subgraphData.randomNumberRequested.transactionHash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            {subgraphData.randomNumberRequested.transactionHash}
                                        </a>
                                    </p>
                                ) : (
                                    <p className="text-base text-gray-500 mt-2">
                                        Not requested yet
                                    </p>
                                )}
                            </div>

                            {/* Merkle Root Submitted */}
                            <div className="bg-white shadow-lg p-5 rounded-lg border border-gray-200">
                                <h3 className="text-xl font-semibold text-blue-700">
                                    Merkle Root Submitted
                                </h3>
                                {subgraphData.merkleRootSubmitted ? (
                                    <>
                                        <p className="text-base text-gray-700 mt-2">
                                            Transaction:{" "}
                                            <a
                                                href={`${explorerUrl}${subgraphData.merkleRootSubmitted.transactionHash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 underline"
                                            >
                                                {subgraphData.merkleRootSubmitted.transactionHash}
                                            </a>
                                        </p>
                                        <p className="text-base text-gray-700 mt-2">
                                            Merkle Root:{" "}
                                            <span className="font-mono text-gray-900">
                                                {subgraphData.merkleRootSubmitted.merkleRoot}
                                            </span>
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-base text-gray-500 mt-2">
                                        Not submitted yet
                                    </p>
                                )}
                            </div>

                            {/* Random Number Generated */}
                            <div className="bg-white shadow-lg p-5 rounded-lg border border-gray-200 mb-10">
                                <h3 className="text-xl font-semibold text-blue-700">
                                    Random Number Generated
                                </h3>
                                {subgraphData.randomNumberGenerated ? (
                                    <>
                                        <p className="text-base text-gray-700 mt-2">
                                            Transaction:{" "}
                                            <a
                                                href={`${explorerUrl}${subgraphData.randomNumberGenerated.transactionHash}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 underline"
                                            >
                                                {
                                                    subgraphData.randomNumberGenerated
                                                        .transactionHash
                                                }
                                            </a>
                                        </p>
                                        <p className="text-base text-gray-700 mt-2">
                                            Random Number:{" "}
                                            <span className="font-mono text-gray-900">
                                                {subgraphData.randomNumberGenerated.randomNumber}
                                            </span>
                                        </p>
                                        <p className="text-base text-gray-700 mt-2">
                                            Participated Operators:{" "}
                                            <span className="font-mono text-gray-900">
                                                {subgraphData.randomNumberGenerated.participatedOperators.join(
                                                    ", "
                                                )}
                                            </span>
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-base text-gray-500 mt-2">
                                        Not generated yet
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    )
}
