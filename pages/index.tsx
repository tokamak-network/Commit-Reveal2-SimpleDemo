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
import { Register } from "../components/MainComponents/Register"
import { RequestTables } from "../components/MainComponents/RequestTables"
import { consumerAbi, consumerContractAddress as consumerContractAddressJson } from "../constants"

export default function TempMain() {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis()
    const chainId = parseInt(chainIdHex!)
    const contractAddresses: { [key: string]: string[] } = consumerContractAddressJson
    const consumerContractAddress =
        chainId in contractAddresses
            ? contractAddresses[chainId][contractAddresses[chainId].length - 1]
            : null
    const [timeRemaining, setTimeRemaining] = useState<string>("00:00:00")
    const [isEventOpen, setIsEventOpen] = useState<boolean>(false)
    const [totalPoint, setTotalPoint] = useState<BigNumberish>(0)
    const [requestIds, setRequestIds] = useState<BigNumberish[]>([])
    const [requestStatus, setRequestStatus] = useState<BigNumberish[]>([])
    const [totalTurns, setTotalTurns] = useState<BigNumberish>(0)
    const [randomNums, setRandomNums] = useState<BigNumberish[]>([])
    const [winnerPoints, setWinnerPoints] = useState<BigNumberish>(0)
    const [winnerLength, setWinnerLength] = useState<BigNumberish>(0)
    const [startTime, setStartTime] = useState<string>("0")
    const [prettyStartTime, setPrettyStartTime] = useState<string>("1. 1. 오전 9:00:00")
    const [prettyDuration, setPrettyDuration] = useState<string>("00hrs 00min 00sec")
    const [duration, setDuration] = useState<string>("0")
    function str_pad_left(string: number, pad: string, length: number) {
        return (new Array(length + 1).join(pad) + string).slice(-length)
    }
    // @ts-ignore
    const { runContractFunction: viewEventInfos } = useWeb3Contract({
        abi: consumerAbi,
        contractAddress: consumerContractAddress!, //,
        functionName: "viewEventInfos", //,
        params: {},
    })

    useInterval(() => {
        let registrationDurationForNextRoundInt = parseInt(duration)
        if (parseInt(startTime) >= 0) {
            let _timeRemaing =
                registrationDurationForNextRoundInt -
                (Math.floor(Date.now() / 1000) - parseInt(startTime))
            if (_timeRemaing > -1) {
                const hours = Math.floor(_timeRemaing / 3600)
                const minutes = Math.floor((_timeRemaing - hours * 3600) / 60)
                const seconds = _timeRemaing - hours * 3600 - minutes * 60
                setTimeRemaining(
                    str_pad_left(hours, "0", 2) +
                        ":" +
                        str_pad_left(minutes, "0", 2) +
                        ":" +
                        str_pad_left(seconds, "0", 2)
                )
                setIsEventOpen(true)
            } else {
                setIsEventOpen(false)
            }
        }
    }, 1000)
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
            const getEventInfosResult: any = await viewEventInfos()
            const eventDuration = 86400 // 24 hours
            let registrationStartTime: BigNumberish = getEventInfosResult[7]
            if (Number(registrationStartTime) > 0)
                registrationStartTime = (Number(registrationStartTime) -
                    eventDuration) as BigNumberish
            let registrationDuration: BigNumberish = eventDuration
            setDuration(registrationDuration.toString())
            const hours = Math.floor(parseInt(registrationDuration.toString()) / 3600)
            const minutes = Math.floor(
                (parseInt(registrationDuration.toString()) - hours * 3600) / 60
            )
            const seconds = parseInt(registrationDuration.toString()) - hours * 3600 - minutes * 60
            setPrettyDuration(
                str_pad_left(hours, "0", 2) +
                    "hrs " +
                    str_pad_left(minutes, "0", 2) +
                    "min " +
                    str_pad_left(seconds, "0", 2) +
                    "sec"
            )
            setStartTime(registrationStartTime.toString())
            setPrettyStartTime(
                new Date(Number(registrationStartTime.toString()) * 1000).toLocaleString().slice(5)
            )
            setTotalPoint(getEventInfosResult[3])
            setRequestIds(getEventInfosResult[0])
            setRandomNums(getEventInfosResult[1])
            setRequestStatus(getEventInfosResult[2])
            setTotalTurns(getEventInfosResult[4])
            setWinnerPoints(getEventInfosResult[5])
            setWinnerLength(getEventInfosResult[6])
        }
    }

    return (
        <>
            {" "}
            <MainHeader />
            <Register
                timeRemaining={timeRemaining}
                duration={prettyDuration}
                startTime={prettyStartTime}
                updateUI={updateUI}
                isEventOpen={isEventOpen}
                totalPoint={totalPoint}
                myTotalTurns={totalTurns}
                winnerPoint={winnerPoints}
                winnerLength={winnerLength}
            />
            <div>
                <RequestTables
                    requestIds={requestIds}
                    randomNums={randomNums}
                    requestStatus={requestStatus}
                    updateUI={updateUI}
                />
            </div>
            {/* <div>
                <RankOfEachParticipantsMain
                    round={round}
                    participatedRounds={participatedRounds}
                    withdrawedRounds={withdrawedRounds}
                    updateUI={updateUI}
                />
            </div>  */}
            <Footer />
        </>
    )
}
