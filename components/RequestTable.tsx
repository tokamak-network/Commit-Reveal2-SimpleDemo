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
import { Table, Tag } from "web3uikit"
import { Container } from "./MainComponents/Container"
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
            <span className="my-auto">
                {isFulfilleds[i] == true ? randomNums[i].toString() : ""}
            </span>,
        ])
    }

    return (
        <div>
            <Container className="relative pb-3.5">
                {getTableContents.length > 0 ? (
                    <div>
                        <div className="mb-6 space-y-6 font-display text-2xl tracking-tight text-blue-900">
                            <div>My Request Info</div>
                        </div>
                        <Table
                            columnsConfig="1fr 1fr 1fr"
                            data={getTableContents}
                            header={[
                                <span className="my-auto">RequestId</span>,
                                <span className="my-auto">Status</span>,
                                <span className="my-auto">RandomNumber</span>,
                            ]}
                            isColumnSortable={[true, false, false]}
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
