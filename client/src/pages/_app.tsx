import { store } from "@/store/store";
import LoadingTask from "@/components/LoadingTask";
import PhoneBottomNavbar from "@/layouts/PhoneBottomNavbar";
import SearchUserDextop from "@/layouts/SearchUserDextop";
import SideNavbar from "@/layouts/SideNavbar";
import "@/styles/globals.css";
import "@/styles/main.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Provider } from "react-redux";
import { ApolloProvider } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client/core";
import BottomNotification from "@/components/BottomNotification";
import Head from "next/head";
import dynamic from "next/dynamic";
import VerifyUser from "@/layouts/VerifyUser";
import { Suspense } from "react";
import IsEditPostRequired from "@/helpers/IsEditPostRequired";
import IsCreateStoryRequired from "@/helpers/IsCreateStoryRequired";
import IsFollowersBoxRequired from "@/helpers/IsFollowersBoxRequired";
import IsFollowingBoxRequired from "@/helpers/IsFollowingBoxRequired";
import IsCreatePostRequired from "@/helpers/IsCreatePostRequired";
import IsViewPostRequired from "@/helpers/IsViewPostRequired";
import IsSharePostRequired from "@/helpers/IsSharePostRequired";
import IsMoreOptionsRequired from "@/helpers/IsMoreOptionsRequired";
import IsDeletePostConfirmationRequired from "@/helpers/IsDeletePostConfirmationRequired";
const NotificationBar = dynamic(() => import("@/layouts/NotificationBar"), {
  ssr: false,
});

const httpLink = createHttpLink({
  uri: "https://api-sharesapce-backend.onrender.com/graphql",
  credentials: "include",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <Head>
       
          <link rel="icon" href="/logo2.png" />
          <title>ShareSpace</title>
        </Head>
        <LoadingTask />
        <div className="App">
          {router.asPath.startsWith("/login") ||
          router.asPath.startsWith("/register") ? null : (
            <SideNavbar />
          )}
         
          <VerifyUser />
          <SearchUserDextop />
          <NotificationBar />
          <Suspense fallback={<div>Loading...</div>}>
            <IsCreateStoryRequired />
            <IsFollowersBoxRequired />
            <IsEditPostRequired />
            <IsFollowingBoxRequired />
            <IsCreatePostRequired />
            <IsViewPostRequired />
            <IsSharePostRequired />
            <IsMoreOptionsRequired />
            <IsDeletePostConfirmationRequired/>
          </Suspense>
          <div
            className={
              router.asPath.startsWith("/direct/inbox") ||
              router.asPath.startsWith("/login") ||
              router.asPath.startsWith("/register")
                ? "-main-parent-container-001 h-100vh flex ai-start jc-center w-100 of-y-scroll normal-width"
                : "-main-parent-container-001 h-100vh flex ai-start jc-center of-y-scroll"
            }
          >
            <Component {...pageProps} />
          </div>
          {
          // router.asPath.startsWith("/story") ||
          // router.asPath.startsWith("/stories") ||
          router.asPath.startsWith("/direct/inbox") ||
          router.asPath.startsWith("/login") ||
          router.asPath.startsWith("/register") || router.asPath.startsWith("/account/edit")? null : (
            <PhoneBottomNavbar />
          )}

          <BottomNotification />
        </div>
      </Provider>
    </ApolloProvider>
  );
}
