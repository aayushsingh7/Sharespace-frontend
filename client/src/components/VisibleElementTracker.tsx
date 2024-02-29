import { FC, useEffect, useRef } from "react";
import ClipLoader from "react-spinners/ClipLoader";

interface VisibleElementTrackerProps {
  offset: number;
  setOffset: Function;
  page: string;
}

const VisibleElementTracker: FC<VisibleElementTrackerProps> = ({
  offset,
  setOffset,
  page,
}) => {
  // const targetRef = useRef(null);

  // useEffect(() => {
    // const observer = new IntersectionObserver((entries) => {
    //   entries.forEach((entry) => {
    //     if (entry.isIntersecting) {
         const changeOffset = ()=> {
        
          if (page === "home") {
            setOffset((old: number) => {
              return old + 4;
            });
          } else if (page === "reel") {
            setOffset((old: number) => {
              return old + 6;
            });
          } else if (page === "savedPosts" || page === "profile") {
            setOffset((old: number) => {
              return old + 6;
            });
          } else {
            setOffset((old: number) => {
              return old + 10;
            });
          }
         }
    //     }
    //   });
    // });

    // if (targetRef.current) {
    //   observer.observe(targetRef.current);
    // }

    // return () => {
    //   if (targetRef.current) {
    //     observer.unobserve(targetRef.current);
    //   }
    // };

  // }, []);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding:"20px"
      }}
    >
      {/* <p
        ref={targetRef}
        style={{
          cursor: "pointer",
          marginTop: "3px",
          marginBottom: "6px",
          padding: "20px",
          position: "relative",
          marginLeft: "17px",
          textAlign: "center",
        }}
      >
        <ClipLoader
          color={"#f1f1f1"}
          loading={true}
          size={45}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </p> */}
      <button className="bg-none b-none load-more-btn c-pointer" onClick={changeOffset}>Load more</button>
    </div>
  );
};

export default VisibleElementTracker;
