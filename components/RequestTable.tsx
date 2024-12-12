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
import { BigNumberish } from "ethers"
import { useState } from "react"
import { Table, Tag } from "web3uikit"
import { Container } from "./MainComponents/Container"
import { DetailButtonAndModal } from "./MainComponents/DetailButtonAndModal"
export function RequestTable({
    requestIds,
    isFulfilleds,
    randomNums,
    updateUI,
}: {
    requestIds: BigNumberish[]
    isFulfilleds: boolean[]
    randomNums: BigNumberish[]
    updateUI: () => Promise<void>
}) {
    const [isRotating, setIsRotating] = useState(false)
    const handleClick = async () => {
        await updateUI()
        setIsRotating(true)
        // Simulate some action or API call
        setTimeout(() => {
            setIsRotating(false)
        }, 1000) // Match this duration with the animation duration
    }
    const getTableContents: any = []
    for (let i = requestIds.length - 1; i >= 0; i--) {
        getTableContents.push([
            <span className="my-auto"> {requestIds[i].toString()} </span>,
            <span className="my-auto">
                {isFulfilleds[i] == false ? (
                    <Tag text="Pending" color="yellow" />
                ) : (
                    <Tag text="Fulfilled" color="blue" />
                )}
            </span>,
            <span className="my-auto m-auto">
                {isFulfilleds[i] == true ? randomNums[i].toString() : ""}
            </span>,
            <span className="my-auto m-auto">
                <DetailButtonAndModal requestId={requestIds[i].toString()} />
            </span>,
        ])
    }

    return (
        <div>
            <Container className="relative pb-3.5">
                {getTableContents.length > 0 ? (
                    <div>
                        <div className="mb-4 flex items-center space-x-1 font-display text-2xl tracking-tight text-blue-900">
                            <div>My Request Info</div>
                            <button
                                onClick={handleClick}
                                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none mt-1"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className={`size-6 ${isRotating ? "animate-spin" : ""}`}
                                >
                                    <path
                                        className="m-auto"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                    />
                                </svg>
                            </button>
                        </div>
                        <Table
                            columnsConfig="1fr 1fr 1fr 1fr"
                            data={getTableContents}
                            header={[
                                <span className="my-auto">RequestId</span>,
                                <span className="my-auto">Status</span>,
                                <span className="my-auto">RandomNumber</span>,
                                <span className="my-auto"></span>,
                            ]}
                            isColumnSortable={[true, false, false, false]}
                            maxPages={Math.ceil(getTableContents.length / 5)}
                            onPageNumberChanged={function noRefCheck() {}}
                            onRowClick={function noRefCheck() {}}
                            pageSize={5}
                        />
                    </div>
                ) : (
                    <div> </div>
                )}
            </Container>
        </div>
    )
}
