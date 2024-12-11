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
import { useMoralis, useWeb3Contract } from "react-moralis"
import { Bell, useNotification } from "web3uikit"
import {
    commitReveal2Abi,
    commitReveal2Address as commitReveal2AddressJSON,
    consumerExampleAbi,
    consumerExampleAddress as consumerExampleAddressJson,
} from "../constants"
import { BackgroundImage } from "./MainComponents/BackgroundImage"
import { Button } from "./MainComponents/Button"
import { Container } from "./MainComponents/Container"

export function Request({
    updateUI,
    totalRequested,
}: {
    updateUI: () => Promise<void>
    totalRequested: BigNumberish
}) {
    const { chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex!)
    const contractAddresses: { [key: string]: string[] } = consumerExampleAddressJson
    const consumerContractAddress =
        !isNaN(chainId) && chainId in contractAddresses
            ? contractAddresses[chainId][contractAddresses[chainId].length - 1]
            : null
    const commitReveal2Addressjson: { [key: string]: string[] } = commitReveal2AddressJSON
    const commitReveal2Address =
        !isNaN(chainId) && chainId in commitReveal2Addressjson
            ? commitReveal2Addressjson[chainId][commitReveal2Addressjson[chainId].length - 1]
            : null

    const dispatch = useNotification()
    const {
        runContractFunction: requestRandomNumber,
        data: requestTxResponse,
        isLoading,
        isFetching, // @ts-ignore
    } = useWeb3Contract()
    // @ts-ignore
    const { runContractFunction: estimateRequestPrice } = useWeb3Contract()
    const { runContractFunction: getActivatedOperatorsLength } = useWeb3Contract({
        abi: commitReveal2Abi,
        contractAddress: commitReveal2Address!,
        functionName: "getActivatedOperatorsLength",
        params: {},
    })

    async function requestFunction() {
        const activatedOperatorsLength: BigNumberish =
            (await getActivatedOperatorsLength()) as BigNumberish
        if (Number(activatedOperatorsLength.toString()) < 2) {
            dispatch({
                type: "error",
                message: "There aren't enough Operators to generate your random number.",
                title: "Error Message",
                position: "topR",
                icon: <Bell />,
            })
            return
        }

        const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any")
        const feeData = await provider.getFeeData()
        let gasPrice = feeData.maxFeePerGas
        if (gasPrice == null) gasPrice = feeData.gasPrice
        console.log(gasPrice?.toString())
        const callbackGasLimit = 82000
        const estimateRequestPriceOption = {
            abi: commitReveal2Abi,
            contractAddress: commitReveal2Address!,
            functionName: "estimateRequestPrice",
            params: {
                callbackGasLimit: callbackGasLimit,
                gasPrice: gasPrice,
            },
        }
        const requestFee = (await estimateRequestPrice({
            params: estimateRequestPriceOption,
            onError: (error: any) => {
                console.log(error)
                return
            },
        })) as BigNumberish
        console.log(requestFee.toString())
        const requestRandomNumberOption = {
            abi: consumerExampleAbi,
            contractAddress: consumerContractAddress!,
            functionName: "requestRandomNumber",
            msgValue: requestFee.toString(),
            params: {},
        }
        await requestRandomNumber({
            params: requestRandomNumberOption,
            onSuccess: handleSuccess,
            onError: (error: any) => {
                console.log(error)
                dispatch({
                    type: "error",
                    message: error.message,
                    title: "Error Message",
                    position: "topR",
                    icon: <Bell />,
                })
                return
            },
        })
    }
    const handleSuccess = async function (tx: any) {
        try {
            handleSentNotification()
            await tx.wait(1)
            handleNewNotification()
            await updateUI()
        } catch (error) {
            console.log(error)
        }
    }
    const handleSentNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Sent, Wait for the Confirmation...",
            title: "Tx Notification",
            position: "topR",
            icon: <Bell />,
        })
    }
    const handleNewNotification = function () {
        dispatch({
            type: "success",
            message: "Transaction Completed",
            title: "Tx Notification",
            position: "topR",
            icon: <Bell />,
        })
    }

    return (
        <div className="relative py-20 sm:pb-24 sm:pt-36 mb-16">
            <BackgroundImage className="-bottom-14 -top-36 " />
            <Container className="relative pb-3.5">
                <div className="mx-auto max-w-2xl lg:max-w-4xl lg:px-12">
                    {consumerContractAddress ? (
                        <>
                            {" "}
                            <h1 className="font-display text-4xl font-bold tracking-tighter text-blue-600 sm:text-5xl flex">
                                <div className="my-auto">Request a Random Number</div>
                            </h1>
                            <div>
                                <div className="mt-7 space-y-6 font-display text-2xl tracking-tight text-blue-900">
                                    Your Requests Count {" : "}
                                    <span className="font-bold text-4xl">
                                        {" "}
                                        {totalRequested.toString()}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 flex" style={{ alignItems: "center" }}>
                                <div className="flex-1 mb-11">
                                    <Button
                                        className={"mt-10 w-full"}
                                        disabled={isLoading || isFetching}
                                        onClick={requestFunction}
                                    >
                                        {isFetching || isLoading ? (
                                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                                        ) : (
                                            <div>Request</div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <h2 className="py-4 px-4 font-bold text-2xl text-red-600 h-60">
                            Connect to Thanos-Sepolia
                        </h2>
                    )}
                </div>
            </Container>
        </div>
    )
}
