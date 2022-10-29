import { ConnectButton } from "web3uikit";

export default function Header() {
    return (<div className="border-b-2 flex flex-row">
        <h1 className="py-4 px-4 font-blog text-3xl">Decentralized  Raffle!</h1>
        <div className="ml-auto py-2 px-4">
            <ConnectButton moralisAuth={false /*Not connecting to a server*/} />
        </div>
    </div>)
}