import { FC, useEffect } from 'react'
import { LOGGED_IN_USER } from '@/graphQl/queries'
import { setToken } from '@/slice/moreSlice'
import { setUserData } from '@/slice/userSlice'
import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import { FaSlideshare } from 'react-icons/fa'
import { useDispatch } from 'react-redux'

interface VerifyProps {

}

const Verify: FC<VerifyProps> = (props) => {

  const router = useRouter()
  const dispatch = useDispatch()

  
  const { loading, data, error } = useQuery(LOGGED_IN_USER, {
    variables: {
      // @ts-ignore
      cookie: props.token,
      // @ts-ignore
    },skip:props.token === null
  });
  
  useEffect(() => {
    if (loading) {
      return;
    }
    if (error) {
        router.push("/login")
    } else {
      if (data?.loggedInUser) {
      // @ts-ignore
        dispatch(setToken(props.token));
        dispatch(setUserData(data.loggedInUser));
        // router.push("/");
      } else {
        router.push("/login");
      }
    }
  }, [loading, data, error]);
  


  

  return (
    <div className="w-100vw h-100dvh flex ai-center jc-center main-bg-color fixed left-0">
      <FaSlideshare style={{ color: "aquamarine", fontSize: "100px" }} />
    </div>
  )
}

export const getServerSideProps = async (context: any) => {
  const { req } = context;

  // @ts-ignore
  const cookieValue = req.headers.cookie?.split(';').find(cookie => cookie.trim().startsWith('sharespace='))
    ?.split('=')[1];

  return {
    props: {
      token: cookieValue || null,
    },
  };
};



export default Verify