import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client"
import type { AppProps } from "next/app"
import Head from "next/head"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"
import "../styles/globals.css"

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: "https://graph-node.thanos-sepolia.tokamak.network/subgraphs/name/commitreveal2",
})

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <MoralisProvider initializeOnMount={false}>
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <Head>
                            <title>Commit-Reveal2 Simple Demo</title>
                            <meta name="description" content="Simple Demo using Commit-Recover2" />
                            <link rel="icon" href="../tokamaklogo.png" />
                        </Head>
                        <Component {...pageProps} />
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
        </>
    )
}

export default MyApp
// initializeonMount : is the optionality to hook into a server to add some more features to our website.
