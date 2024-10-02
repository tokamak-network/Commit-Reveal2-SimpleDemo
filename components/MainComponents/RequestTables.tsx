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
import { BigNumberish, ethers } from "ethers"
import { decodeError } from "ethers-decode-error"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { Bell, Button, Table, Tag, useNotification } from "web3uikit"
import {
    consumerAbi,
    consumerContractAddress as consumerContractAddressJson,
    rngCoordinatorAddress as coordinatorAddressJson,
    rngCoordinatorAbi,
} from "../../constants"
import { Container } from "./Container"
export function RequestTables({
    requestIds,
    randomNums,
    requestStatus,
    updateUI,
}: {
    requestIds: BigNumberish[]
    randomNums: BigNumberish[]
    requestStatus: BigNumberish[]
    updateUI: () => Promise<void>
}) {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis()
    const chainId = parseInt(chainIdHex!)
    const contractAddresses: { [key: string]: string[] } = consumerContractAddressJson
    const consumerAddress =
        chainId in contractAddresses
            ? contractAddresses[chainId][contractAddresses[chainId].length - 1]
            : null

    const coordinatorAddresses: { [key: string]: string[] } = coordinatorAddressJson
    const coordinatorAddress =
        chainId in coordinatorAddresses
            ? coordinatorAddresses[chainId][coordinatorAddresses[chainId].length - 1]
            : null

    const [tableContents, setTableContents] = useState<any>([])
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const getTableContents: any = []
    const getSecondTableContens: any = []
    const getPoint = (randomNumber: number, requestStatus: number) => {
        if (requestStatus === 2) {
            if (randomNumber === 0) return 100
            else if (randomNumber < 4) return 30
            else if (randomNumber < 14) return 20
            else if (randomNumber < 54) return 10
            else if (randomNumber < 100) return -5
        }
        return null
    }
    const getImage = (randomNumber: number) => {
        if (randomNumber === 0) return "../../ethereal.png"
        else if (randomNumber < 4) return "../../platinum.png"
        else if (randomNumber < 14) return "../../golden.png"
        else if (randomNumber < 54) return "../../silver.png"
        else if (randomNumber < 100) return "../../bronze.png"
    }
    const pendingRequestIds: any = []
    for (let i = 0; i < requestIds.length; i++) {
        if (requestStatus[i].toString() === "1") {
            pendingRequestIds.push(requestIds[i])
        }
    }
    const dispatch = useNotification()
    // @ts-ignore
    const { runContractFunction: getRefundRuleNumsForRounds } = useWeb3Contract()
    // @ts-ignore
    const { runContractFunction: getRefundConditionInfos } = useWeb3Contract()

    const getRefundFunction = async (requestId: BigNumberish) => {
        setIsFetching(true)
        const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any")
        // Prompt user for account connections
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const consumerContract = new ethers.Contract(consumerAddress!, consumerAbi, provider)
        try {
            const tx = await consumerContract
                .connect(signer)
                .getRefund(requestId, { gasLimit: 200000 })
            await handleSuccess(tx)
        } catch (error: any) {
            console.log(error.message)
            const decodedError = decodeError(decodeError(error))
            setIsFetching(false)
            dispatch({
                type: "error",
                message: decodedError.error,
                title: "Error Message",
                position: "topR",
                icon: <Bell />,
            })
        }
    }
    const handleSuccess = async function (tx: any) {
        await tx.wait(1)
        handleNewNotification()
        setTimeout(() => {
            setIsFetching(false)
        }, 6000)
        await updateUI()
    }
    const handleNewNotification = function () {
        setTimeout(() => {
            dispatch({
                type: "info",
                message: "Transaction Completed",
                title: "Tx Notification",
                position: "topR",
                icon: <Bell />,
            })
        }, 6000)
    }

    const getRefundRuleNumsForRoundsFunction = async () => {
        setTableContents(getTableContents)
        if (pendingRequestIds.length !== 0) {
            const getRefundRuleNumsForRoundsOptions = {
                abi: rngCoordinatorAbi,
                contractAddress: coordinatorAddress!,
                functionName: "getRefundRuleNumsForRounds",
                params: {
                    rounds: pendingRequestIds,
                },
            }
            // const getRefundRuleNumsForRoundsResult: any = await getRefundRuleNumsForRounds({
            //     params: getRefundRuleNumsForRoundsOptions,
            //     onError: (error: any) => console.log(error),
            // })
            const getRefundConditionInfosOptions = {
                abi: rngCoordinatorAbi,
                contractAddress: coordinatorAddress!,
                functionName: "getRefundConditionInfos",
                params: {
                    rounds: pendingRequestIds,
                },
            }
            const getRefundConditionInfosResult: any = await getRefundConditionInfos({
                params: getRefundConditionInfosOptions,
                onError: (error: any) => {
                    console.log(error)
                    return
                },
            })

            const currentBlockTimestamp = Math.floor(Date.now() / 1000)
            const maxWait = Number(getRefundConditionInfosResult[4].toString())
            const revealDuration = Number(getRefundConditionInfosResult[5].toString())
            const getRefundRuleNumsForRoundsResult: Number[] = []
            for (let i = 0; i < pendingRequestIds.length; i++) {
                const commitEndTime = Number(getRefundConditionInfosResult[0][i].toString())
                const commitLength = Number(getRefundConditionInfosResult[1][i].toString())
                const revealLength = Number(getRefundConditionInfosResult[2][i].toString())
                const requestedTime = Number(getRefundConditionInfosResult[3][i].toString())
                if (currentBlockTimestamp > requestedTime + maxWait && commitLength == 0)
                    getRefundRuleNumsForRoundsResult.push(1)
                else if (commitLength > 0) {
                    if (commitLength < 2 && currentBlockTimestamp > commitEndTime)
                        getRefundRuleNumsForRoundsResult.push(2)
                    else if (
                        currentBlockTimestamp > commitEndTime + revealDuration &&
                        revealLength < commitLength
                    )
                        getRefundRuleNumsForRoundsResult.push(3)
                    else getRefundRuleNumsForRoundsResult.push(0)
                } else {
                    getRefundRuleNumsForRoundsResult.push(0)
                }
            }
            let j = 0
            if (getTableContents.length === requestIds.length) {
                for (let i = 0; i < requestIds.length; i++) {
                    if (requestStatus[i].toString() === "1") {
                        if (
                            getRefundRuleNumsForRoundsResult[j].toString() === "2" ||
                            getRefundRuleNumsForRoundsResult[j].toString() === "3"
                        ) {
                            j++
                            getTableContents.push(
                                <span className="my-auto">
                                    <Button
                                        color="red"
                                        onClick={() => {
                                            setIsFetching(true)
                                            getRefundFunction(requestIds[i])
                                        }}
                                        text="get refund"
                                        theme="colored"
                                        disabled={isFetching}
                                        isLoading={isFetching}
                                    />
                                </span>
                            )
                            getTableContents[i][1] = <Tag text="Failed" color="red" />
                        }
                    } else {
                        getTableContents.push(<span className="my-auto"></span>)
                    }
                }
                setTableContents(getTableContents)
            }
        }
    }
    useEffect(() => {
        getRefundRuleNumsForRoundsFunction()
    }, [requestIds])

    for (let i = 0; i < requestIds.length; i++) {
        getTableContents.push([
            <span className="my-auto"> {requestIds[i].toString()} </span>,
            <span className="my-auto">
                {requestStatus[i].toString() === "1" ? (
                    <Tag text="Pending" color="yellow" />
                ) : requestStatus[i].toString() === "2" ? (
                    <Tag text="Fulfilled" color="blue" />
                ) : (
                    <Tag text="Refunded" color="red" />
                )}
            </span>,
            <span className="my-auto">
                {requestStatus[i].toString() === "2"
                    ? Number(randomNums[i].toString().slice(-2))
                    : null}
            </span>,
            <span className="my-auto">
                {getPoint(
                    Number(randomNums[i].toString().slice(-2)),
                    Number(requestStatus[i].toString())
                )}
            </span>,
            <span className="my-auto">
                {requestStatus[i].toString() === "2" ? (
                    <img
                        src={getImage(Number(randomNums[i].toString().slice(-2)))}
                        width="70rem"
                    />
                ) : (
                    <span> </span>
                )}
            </span>,
        ])
    }

    return (
        <div>
            <Container className="relative pb-3.5">
                {requestIds.length > 0 ? (
                    <>
                        {" "}
                        <div className="mb-6 space-y-6 font-display text-2xl tracking-tight text-blue-900">
                            <div>My Request Info</div>
                        </div>
                        <Table
                            columnsConfig="1fr 1fr 1fr 1fr 1fr 1fr"
                            data={tableContents}
                            header={[
                                <span className="my-auto">RequestId</span>,
                                <span className="my-auto">Status</span>,
                                <span className="my-auto">RandomNumber</span>,
                                <span className="my-auto">Point</span>,
                                <span className="my-auto"></span>,
                                <span className="my-auto"></span>,
                            ]}
                            isColumnSortable={[true, false, false]}
                            maxPages={Math.ceil(requestIds.length / 5)}
                            onPageNumberChanged={function noRefCheck() {}}
                            onRowClick={function noRefCheck() {}}
                            pageSize={5}
                        />
                    </>
                ) : (
                    <> </>
                )}

                {getSecondTableContens.length > 0 ? (
                    <>
                        <div className="mt-6 mb-6 space-y-6 font-display text-2xl tracking-tight text-blue-900">
                            <div>Currently eligible for prizes</div>
                        </div>
                        <Table
                            columnsConfig="1fr 1fr 1fr 1fr"
                            data={getSecondTableContens}
                            header={[
                                <span>Random Number</span>,
                                <span>Number of people with this random number</span>,
                                <span>Prize Amount</span>,
                            ]}
                            isColumnSortable={[false, false, false]}
                            maxPages={Math.ceil(requestIds.length / 5)}
                            onPageNumberChanged={function noRefCheck() {}}
                            onRowClick={function noRefCheck() {}}
                            pageSize={5}
                        />
                    </>
                ) : (
                    <></>
                )}
            </Container>
        </div>
    )
}
