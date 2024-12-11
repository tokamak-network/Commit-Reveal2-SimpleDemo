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
import { BigNumberish } from "ethers"
import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useInterval } from "use-interval"
import { Footer } from "../components/Footer"
import { MainHeader } from "../components/MainComponents/MainHeader"
import { Request } from "../components/Request"
import { RequestTable } from "../components/RequestTable"
import {
    consumerExampleAbi,
    consumerExampleAddress as consumerExampleAddressJson,
} from "../constants"

export default function Main() {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis()
    const chainId = parseInt(chainIdHex!)
    const contractAddresses: { [key: string]: string[] } = consumerExampleAddressJson
    const consumerContractAddress =
        chainId in contractAddresses
            ? contractAddresses[chainId][contractAddresses[chainId].length - 1]
            : null

    const [requestIds, setRequestIds] = useState<BigNumberish[]>([])
    const [isFulfilleds, setIsFulfilleds] = useState<boolean[]>([])
    const [randomNums, setRandomNums] = useState<BigNumberish[]>([])

    // @ts-ignore
    const { runContractFunction: getYourRequests } = useWeb3Contract({
        abi: consumerExampleAbi,
        contractAddress: consumerContractAddress!,
        functionName: "getYourRequests",
        params: {},
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled, account])
    useInterval(() => {
        updateUI()
    }, 11000)

    async function updateUI() {
        if (consumerContractAddress) {
            const getRequestsInfos: any = await getYourRequests()
            setRequestIds(getRequestsInfos[0])
            setIsFulfilleds(getRequestsInfos[1])
            setRandomNums(getRequestsInfos[2])
        }
    }

    return (
        <>
            {" "}
            <MainHeader />
            <Request updateUI={updateUI} totalRequested={requestIds.length} />
            <div>
                <RequestTable
                    requestIds={requestIds}
                    isFulfilleds={isFulfilleds}
                    randomNums={randomNums}
                    updateUI={updateUI}
                />
            </div>
            <Footer />
        </>
    )
}
