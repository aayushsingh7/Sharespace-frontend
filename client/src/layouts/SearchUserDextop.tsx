import { FC, useEffect, useRef, useState } from "react";
import UserBox from "@/components/UserBox";
import { SEARCH_USERS } from "@/graphQl/queries";
import { RootState } from "@/store/store";
import { UserType } from "@/types/types";
import { useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";

interface SearchUserDextopProps {}

const SearchUserDextop: FC<SearchUserDextopProps> = ({}) => {
  const loggedInUser = useSelector((state:RootState)=> state.user.user)
  const userSearch = useSelector((state: RootState) => state.navbar.userSearch);
  const [query, setQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<UserType[]>();
  const inputRef = useRef<any>(null)

  const { loading, data, error, refetch } = useQuery(SEARCH_USERS, {
    variables: {
      username:loggedInUser.username,
      query: query,
    },
    skip: query === "",
  });

  useEffect(() => {
    const getSearchResults = async () => {
      try {
        await refetch().then(({ data }) => {
          setSearchResults(data.searchUsers);
        });
      } catch (err) {
        console.log(err);
      }
    };
    if (query !== "") {
      getSearchResults();
    }
  }, [query]);

  useEffect(() => {
    if(!userSearch) return
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [userSearch]);

  return (
    <div
    className={`main-bg-color absolute h-100dvh p-10 zi-10 b-right search-user-dextop-container ${userSearch ? "sudc-show" : "sudc-hide"}`}

    >
      <div className="b-bottom p-custom" >
        <h3>Search</h3>
        <input
        className="btn w-100 br-10 primary-text-color dark-bg-color fs-m-normal"
        style={{padding:"13px",marginTop:"30px"}}
          type="text"
          placeholder="Search by name or username"
          onChange={(e) => setQuery(e.target.value)}
          value={query}
          ref={inputRef}
        />
      </div>

      <div className={`w-100 flex ai-start jc-start f-d-c`} style={{padding:"12px 0px"}}>
        {loading ? (
          <p className="flex ai-center jc-center w-100 primary-text-color p-10">
            <ClipLoader
              color={"#f1f1f1"}
              loading={true}
              size={45}
              aria-label="Loading Spinner"
              data-testid="loader"
              />
          </p>
              //@ts-ignore
        ) : searchResults?.length <= 0 ? (
          <p className="flex ai-center jc-center w-100 primary-text-color p-10" style={{fontSize:"17px"}}>No user found</p>
        ) : (
          searchResults?.map((user: UserType) => {
            return (
              <UserBox
                followBtn={false}
                hover={true}
                key={user.id}
                data={user}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default SearchUserDextop;
