/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { motion } from 'framer-motion';
import lotteryAbi from '@/app/contract/Lottery.json';

const LotteryApp = () => {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [lotteryContract, setLotteryContract] = useState<any>(null);
    const [manager, setManager] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [winner, setWinner] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const provider = await detectEthereumProvider();
            if (provider) {
                const web3Instance = new Web3(provider as any);
                setWeb3(web3Instance);

                const contractAddress = '0x710A6c921BB3053bA5dB4be8220ECf7D0Bb37BC6';
                const lotteryContractInstance = new web3Instance.eth.Contract(lotteryAbi, contractAddress);
                setLotteryContract(lotteryContractInstance);

                const managerAddress: string = await lotteryContractInstance.methods.manager().call();
                console.log('Manager Address:', managerAddress);
                setManager(managerAddress.trim().toLowerCase());
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
                setAccount(accounts[0].trim().toLowerCase());
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
            setLoading(true);
            try {
                await lotteryContract.methods.enter().send({
                    from: account,
                    value: web3.utils.toWei('0.01', 'ether'),
                    gas: 3000000,
                    gasPrice: web3?.utils.toWei('50', 'gwei')
                });
                console.log('Successfully entered the lottery');
                setMessage('You have successfully entered the lottery!');
            } catch (error) {
                console.error('Error entering lottery:', error);
                setMessage('Failed to enter the lottery. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const pickWinner = async () => {
        if (lotteryContract && account === manager) {
            setLoading(true);
            try {
                await lotteryContract.methods.pickWinner().send({
                    from: account,
                    gas: 3000000,
                    gasPrice: web3?.utils.toWei('50', 'gwei')
                });
                console.log('Winner picked successfully');
                const winnerAddress = await lotteryContract.methods.getPlayers().call();
                setWinner(winnerAddress[0]);
                setMessage(`The winner has been picked! Winner: ${winnerAddress[0]}`);
            } catch (error) {
                console.error('Error picking winner:', error);
                setMessage('Failed to pick a winner. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            setMessage('Only the contract owner can pick a winner.');
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
                disabled={!account || loading}
                className={`mb-4 px-6 py-2 rounded-lg transition duration-300 ${account ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
            >
                Enter Lottery
            </button>
            {account === manager && (
                <button
                    onClick={pickWinner}
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition duration-300"
                >
                    Pick Winner
                </button>
            )}
            {loading && (
                <motion.div
                    className="loader mt-4"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <div className="w-8 h-8 border-4 border-t-4 border-blue-500 rounded-full"></div>
                </motion.div>
            )}
            {message && (
                <p className="mt-4 text-lg text-center text-blue-500">{message}</p>
            )}
            {winner && (
                <p className="mt-4 text-lg text-center text-green-500">Winner Address: {winner}</p>
            )}
        </div>
    );
};

export default LotteryApp;