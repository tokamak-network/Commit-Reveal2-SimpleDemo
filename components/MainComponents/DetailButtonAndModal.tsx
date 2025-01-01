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
import { gql, useLazyQuery } from "@apollo/client"
import { useState } from "react"
import { Button } from "web3uikit"
import { DetailModal, SubgraphData } from "./DetailModal"

export function DetailButtonAndModal({ requestId }: { requestId: string }) {
    const [showModal, setShowModal] = useState(false)
    const [subgraphData, setSubgraphData] = useState<SubgraphData | null>(null)
    const [loading, setLoading] = useState(false)
    const hideModal = () => setShowModal(false)
    const getRoundInfo = gql`
        {
            rounds(where: { round: ${requestId} }) {
                round
                merkleRootSubmitted {
                    transactionHash
                    merkleRoot
                }
                randomNumberGenerated {
                    transactionHash
                    participatedOperators
                    randomNumber
                }
                randomNumberRequested {
                    transactionHash
                }
            }
        }
    `
    const [fetchRoundInfo] = useLazyQuery(getRoundInfo, {
        fetchPolicy: "no-cache",
    })
    const handleButtonClick = async function () {
        const { loading, error: subgraphQueryError, data: subgraphData } = await fetchRoundInfo()
        setSubgraphData(subgraphData.rounds[0])
        setLoading(loading)
        setShowModal(true)
    }
    return (
        <>
            <DetailModal
                isVisible={showModal}
                onClose={hideModal}
                subgraphData={subgraphData}
                loading={loading}
            />
            <Button
                style={{ paddingTop: 2, paddingBottom: 0 }}
                onClick={handleButtonClick}
                text="details"
                theme="outline"
            />
        </>
    )
}
