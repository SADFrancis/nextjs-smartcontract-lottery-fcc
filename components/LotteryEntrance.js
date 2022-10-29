import React, { useEffect, useState } from 'react';
import { useWeb3Contract } from 'react-moralis';
import { abi, contractAddresses } from '../constants';
import { useMoralis } from 'react-moralis';
import { ethers } from "ethers";
import { useNotification } from 'web3uikit';

export default function LotteryEntrance() {
    const { chainId:chainIdHex, isWeb3Enabled } = useMoralis();
    const chainId = parseInt(chainIdHex);
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0]: null;
    const [entranceFee, setEntranceFee] = useState("0")
    const [readableEntranceFee, setReadableEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0");

    const dispatch = useNotification();

    async function updateUI() {
        const calledEntranceFee = (await getEntranceFee()).toString()
        const calledNumPlayers = (await getNumOfPlayers()).toString()
        const calledRecentWinner = (await getRecentWinner())
        setReadableEntranceFee(ethers.utils.formatUnits(calledEntranceFee, "ether")); // converts from hex here
        setEntranceFee(calledEntranceFee); 
        setNumPlayers(calledNumPlayers);
        setRecentWinner(calledRecentWinner);
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1);
        handleNewNotification(tx);
        updateUI();
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon:"bell"

        }

        )
    }
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //specifying networkId
        functionName: "getEntranceFee",
        params: {},
    })


    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //specifying networkId
        functionName: "getRecentWinner",
        params: {},
    })
    const { runContractFunction: getNumOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //specifying networkId
        functionName: "getNumOfPlayers",
        params: {},
    })
    const { runContractFunction: enterRaffle, isLoading, isFetching } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //specifying networkId
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })
    return (
        <div className='p-5'>LotteryEntrance
            {raffleAddress ? (
                <div>
                    <button className='bg-blue-500 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded ml-auto' onClick={async function () {
                        await enterRaffle({
                            onSuccess: handleSuccess,
                            onError: (error) => console.log(error),
                        })
                       
                    }}
                        disabled={isLoading || isFetching /*when transaction is being confirmed disable button*/}
                    >
                        {isLoading || isFetching ? (<div className="animate-spin spinnerborder h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div> Enter Raffle</div>
                        )}

                    </button>
                    <div>Entrance Fee: {readableEntranceFee} ETH</div>
                    <div>Number of Players: {numPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                </div>
                
            ) : (
                    <div>No Raffle Address detected </div>
            ) }
        
        </div>
  )
}
