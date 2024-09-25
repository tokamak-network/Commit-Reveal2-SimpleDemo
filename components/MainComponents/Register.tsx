// Copyright 2024 justin
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { BigNumberish, ethers } from "ethers"
import { decodeError } from "ethers-decode-error"
import { useState } from "react"
import { useMoralis } from "react-moralis"
import { Bell, useNotification } from "web3uikit"
import {
    consumerAbi,
    consumerContractAddress as consumerContractAddressJSON,
    rngCoordinatorAddress as crrngCoordinatorAddressJSON,
    rngCoordinatorAbi,
} from "../../constants"
import { BackgroundImage } from "./BackgroundImage"
import { Button } from "./Button"
import { Container } from "./Container"
declare type TValue = 1 | 2 | 3 | 4 | 5 | 6
declare type TDiceRef = {
    rollDice: (value: TValue) => void
}
export function Register({
    timeRemaining,
    duration,
    startTime,
    updateUI,
    isEventOpen,
    totalPoint,
    myTotalTurns,
    winnerPoint,
    winnerLength,
}: {
    timeRemaining: string
    duration: string
    startTime: string
    updateUI: () => Promise<void>
    isEventOpen: boolean
    totalPoint: BigNumberish
    myTotalTurns: BigNumberish
    winnerPoint: BigNumberish
    winnerLength: BigNumberish
}) {
    const { chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex!)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const contractAddresses: { [key: string]: string[] } = consumerContractAddressJSON
    const consumerAddress =
        !isNaN(chainId) && chainId in contractAddresses
            ? contractAddresses[chainId][contractAddresses[chainId].length - 1]
            : null
    const rngCoordinatorAddresses: { [key: string]: string[] } = crrngCoordinatorAddressJSON
    const getRngCoordinatorAddress =
        !isNaN(chainId) && chainId in rngCoordinatorAddresses
            ? rngCoordinatorAddresses[chainId][rngCoordinatorAddresses[chainId].length - 1]
            : null
    const dispatch = useNotification()

    async function requestFunction() {
        setIsFetching(true)
        const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any")
        // Prompt user for account connections
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const consumerContract = new ethers.Contract(consumerAddress!, consumerAbi, provider)

        const rngCoordinator = new ethers.Contract(
            getRngCoordinatorAddress!,
            rngCoordinatorAbi,
            provider
        )

        const activatedOperatorsLength = await rngCoordinator.getActivatedOperatorsLength()
        if (Number(activatedOperatorsLength.toString()) < 2) {
            dispatch({
                type: "error",
                message:
                    "There aren't enough Operators to generate your random number yet. Please try again later.",
                title: "Error Message",
                position: "topR",
                icon: <Bell />,
            })
            setIsFetching(false)
            return
        }
        try {
            const feeData = await provider.getFeeData()
            let gasPrice = feeData.maxFeePerGas
            if (gasPrice == null) gasPrice = feeData.gasPrice
            const callbackGasLimit = await consumerContract.CALLBACK_GAS_LIMIT()
            const directFundingCost = await rngCoordinator.estimateRequestPrice(
                callbackGasLimit,
                gasPrice?.toString()
            )

            const directFundingCostInt = Math.floor(Number(directFundingCost.toString()))
            const tx = await consumerContract
                .connect(signer)
                .play({ gasLimit: 1000000, value: directFundingCostInt })
            await handleSuccess(tx)
        } catch (error: any) {
            console.log(error.message)
            const decodedError = decodeError(decodeError(error))
            dispatch({
                type: "error",
                message: decodedError.error,
                title: "Error Message",
                position: "topR",
                icon: <Bell />,
            })
            setIsFetching(false)
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

    return (
        <div className="relative py-20 sm:pb-24 sm:pt-36 mb-16">
            <BackgroundImage className="-bottom-14 -top-36 " />
            <Container className="relative pb-3.5">
                <div className="mx-auto max-w-2xl lg:max-w-4xl lg:px-12">
                    {consumerAddress ? (
                        <>
                            {" "}
                            <h1 className="font-display text-5xl font-bold tracking-tighter text-blue-600 sm:text-7xl ">
                                Get Rare Title 🎖️
                            </h1>
                            {isEventOpen ? (
                                <div></div>
                            ) : (
                                <div className="mt-6 space-y-6 font-display text-2xl tracking-tight text-red-900">
                                    The event is Not in progress.
                                </div>
                            )}
                            <div>
                                <div className="mt-7 space-y-6 font-display text-2xl tracking-tight text-green-900">
                                    Current winner score {" : "}
                                    <span className="font-bold text-4xl">
                                        {" "}
                                        {winnerPoint.toString() == "-100"
                                            ? "0"
                                            : winnerPoint.toString()}
                                    </span>
                                </div>
                                <div className="mt-2 space-y-6 font-display text-2xl tracking-tight text-green-900">
                                    Current number of winners{" : "}
                                    <span className="font-bold text-4xl">
                                        {" "}
                                        {winnerLength.toString()}
                                    </span>
                                </div>
                                <div className="mt-7 space-y-6 font-display text-2xl tracking-tight text-blue-900">
                                    Your total score {" : "}
                                    <span className="font-bold text-4xl">
                                        {" "}
                                        {totalPoint.toString()}
                                    </span>
                                </div>
                                <div className="mt-2 space-y-6 font-display text-2xl tracking-tight text-blue-900">
                                    Your remaining turns{" : "}
                                    <span className="font-bold text-4xl">
                                        {" "}
                                        {(10 - Number(myTotalTurns)).toString()}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 flex" style={{ alignItems: "center" }}>
                                <div className="flex-1 mb-11">
                                    <Button
                                        className={
                                            "mt-10 w-full " +
                                            (!isEventOpen || myTotalTurns.toString() === "10"
                                                ? "opacity-20"
                                                : "")
                                        }
                                        disabled={
                                            !isEventOpen ||
                                            isFetching ||
                                            myTotalTurns.toString() === "10"
                                                ? true
                                                : false
                                        }
                                        onClick={requestFunction}
                                    >
                                        {isFetching ? (
                                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                                        ) : (
                                            <div>
                                                {myTotalTurns.toString() === "10"
                                                    ? "Exhausted all your turns"
                                                    : "Request a Title"}
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            {/* <div className="mt-6 space-y-6 font-display text-2xl tracking-tight text-blue-900">
                                <div>RequestIds: {requestIds.toString()}</div>
                                <div>RandomNumbers: {randomNums.toString()}</div>
                            </div> */}
                            <dl className="mt-10 grid grid-cols-2 gap-x-10 gap-y-6 sm:mt-16 sm:gap-x-16 sm:gap-y-10 sm:text-center lg:auto-cols-auto lg:grid-flow-col lg:grid-cols-none lg:justify-start lg:text-left">
                                {[
                                    ["Time Remaining", timeRemaining],
                                    ["Duration", duration],
                                    [`Started At`, startTime],
                                ].map(([name, value]) => (
                                    <div key={name}>
                                        <dt className="font-mono text-sm text-blue-600">{name}</dt>
                                        <dd className="mt-0.5 text-2xl font-semibold tracking-tight text-blue-900">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </>
                    ) : (
                        <h2 className="py-4 px-4 font-bold text-2xl text-red-600 h-60">
                            Connect to Titan-Sepolia, Titan
                        </h2>
                    )}
                </div>
            </Container>
        </div>
    )
}
