import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import lotteryAbi from '@/app/contract/Lottery.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const lotteryAddress = '0x710A6c921BB3053bA5dB4be8220ECf7D0Bb37BC6';
const lotteryContract = new ethers.Contract(lotteryAddress, lotteryAbi, signer);

export default function Lottery() {
  const [manager, setManager] = useState('');
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState('');

  useEffect(() => {
    async function fetchData() {
      const manager = await lotteryContract.manager();
      setManager(manager);

      const players = await lotteryContract.getPlayers();
      setPlayers(players);

      const balance = await provider.getBalance(lotteryContract.address);
      setBalance(ethers.utils.formatEther(balance));
    }

    fetchData();
  }, []);

  return (
    <div>
      <h2>Lottery Contract</h2>
      <p>This contract is managed by {manager}.</p>
      <p>There are currently {players.length} people entered, competing to win {balance}</p>
    </div>
  );
}