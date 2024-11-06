/* eslint-disable @typescript-eslint/no-explicit-any */
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

                const contractAddress = '0x710A6c921BB3053bA5dB4be8220ECf7D0Bb37BC6';
                const lotteryContractInstance = new web3Instance.eth.Contract(lotteryAbi, contractAddress);
                setLotteryContract(lotteryContractInstance);
            } else {
                console.error('MetaMask not detected');
            }
        };
        init();
    }, []);

    const connectWallet = async () => {
        if (web3) {
            try {
                const accounts = await web3.eth.requestAccounts();
                setAccount(accounts[0]);
                console.log('Connected account:', accounts[0]);
            } catch (error) {
                console.error('Error connecting to MetaMask:', error);
            }
        } else {
            console.error('Web3 not initialized');
        }
    };

    const enterLottery = async () => {
        if (lotteryContract && account && web3) {
            try {
                await lotteryContract.methods.enter().send({ from: account, value: web3.utils.toWei('0.01', 'ether') });
            } catch (error) {
                console.error('Error entering lottery:', error);
            }
        }
    };

    const pickWinner = async () => {
        if (lotteryContract && account) {
            try {
                await lotteryContract.methods.pickWinner().send({ from: account });
            } catch (error) {
                console.error('Error picking winner:', error);
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Lottery App</h1>
            {account ? (
                <p className="mb-4 text-lg">Connected Account: {account}</p>
            ) : (
                <button
                    onClick={connectWallet}
                    className="mb-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                >
                    Connect MetaMask
                </button>
            )}
            <button
                onClick={enterLottery}
                disabled={!account}
                className={`mb-4 px-6 py-2 rounded-lg transition duration-300 ${account ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
            >
                Enter Lottery
            </button>
            <button
                onClick={pickWinner}
                disabled={!account}
                className={`px-6 py-2 rounded-lg transition duration-300 ${account ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
            >
                Pick Winner
            </button>
        </div>
    );
};

export default LotteryApp;