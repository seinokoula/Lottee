
"use client";

import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import lotteryAbi from '@/app/contract/Lottery.json';

const LotteryApp = () => {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [lotteryContract, setLotteryContract] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            const provider = await detectEthereumProvider();
            if (provider) {
                const web3Instance = new Web3(provider as any);
                setWeb3(web3Instance);

                const accounts = await web3Instance.eth.requestAccounts();
                setAccount(accounts[0]);

                const contractAddress = '0x710A6c921BB3053bA5dB4be8220ECf7D0Bb37BC6';
                
                const lotteryContractInstance = new web3Instance.eth.Contract(lotteryAbi, contractAddress);
                setLotteryContract(lotteryContractInstance);
            } else {
                console.error('MetaMask not detected');
            }
        };
        init();
    }, []);

    const enterLottery = async () => {
        if (lotteryContract && account && web3) {
            await lotteryContract.methods.enter().send({ from: account, value: web3.utils.toWei('0.01', 'ether') });
        }
    };

    const pickWinner = async () => {
        if (lotteryContract && account) {
            await lotteryContract.methods.pickWinner().send({ from: account });
        }
    };

    return (
        <div>
            <h1>Lottery App</h1>
            {account ? <p>Connected Account: {account}</p> : <p>Please connect MetaMask</p>}
            <button onClick={enterLottery}>Enter Lottery</button>
            <button onClick={pickWinner}>Pick Winner</button>
        </div>
    );
};

export default LotteryApp;