import ReelBox from "@/components/ReelBox";
import VisibleElementTracker from "@/components/VisibleElementTracker";
import { REELS } from "@/graphQl/queries";
import { handleLoadingTask } from "@/slice/moreSlice";
import { addLoadedReels, setReels } from "@/slice/postSlice";
import { RootState } from "@/store/store";
import { ReelType } from "@/types/types";
import {
  useApolloClient,
  useQuery,
} from "@apollo/client";
import Head from "next/head";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import io from 'socket.io-client';

interface ReelProps {}

const Reel: FC<ReelProps> = ({}) => {
  const router = useRouter();
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const reels = useSelector((state: RootState) => state.post.reels);
  const [socket,setSocket] = useState<any>()
  const [offset, setOffset] = useState<number>(0);
  const client = useApolloClient();

  const { loading, data, error, refetch } = useQuery(REELS, {
    variables: {
      userId: loggedInUser.id,
      skip: offset,
    },fetchPolicy:"network-only",
  });

  useEffect(() => {
    const loadMoreReels = async () => {
      try {
        if (offset === 0) return;
        const { data } = await refetch();
        if (data?.reels) {
          dispatch(addLoadedReels(data.reels));
          const oldReels = client.readQuery({
            query: REELS,
            variables: {
              userId: loggedInUser.id,
            },
          });

          client.writeQuery({
            query: REELS,
            variables: {
              userId: loggedInUser.id,
            },
            data: {
              reels: [...oldReels.reels, ...data?.reels],
            },
          });
        }
      } catch (err) {}
    };

    loadMoreReels();
  }, [offset]);

  useEffect(() => {
    if (offset === 0) {
      dispatch(handleLoadingTask(true));
      if (loading) return;
      if (data?.reels) {
        dispatch(setReels(data?.reels));
        dispatch(handleLoadingTask(false));
      }
    }
  }, [data]);

  
  useEffect(() => {
    const s = io("https://api-sharesapce-backend.onrender.com/");
    
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <>
      <Head>
        <title>ShareSpace</title>
      </Head>
      <div className="w-100 h-100dvh flex ai-center jc-start f-d-c of-y-scroll flex-grow wwyyxx reels-container">
        <AiOutlineArrowLeft
          style={{
            color: "white",
            fontSize: "30px",
            position: "fixed",
            left: "3%",
            top: "2%",
            zIndex: "100",
          }}
          onClick={() => router.back()}
          className="hs"
        />
        {loading && reels.length <= 0  ? (
         <div className="reels-loading"></div>
        ) : (
          reels.map((reel: ReelType) => {
            return <ReelBox data={reel} key={reel.id} socket={socket} />;
          })
        )}
        {reels.length > 0 ?  data?.reels?.length <=0 ? <p className="w-100 p-20 fs-normal primary-text-color flex ai-center jc-center">All caught up! More coming soon.</p>  :  (
          <VisibleElementTracker
            offset={offset}
            setOffset={setOffset}
            page="reel"
          />
        ) : null}
      </div>
    </>
  );
};

export default Reel;
