import { showBottomNotification } from "@/slice/moreSlice";

let timeoutId: any;

const bottomNotification = (dispatch: any, text: string) => {   
  clearTimeout(timeoutId);
  dispatch(showBottomNotification({ text: text, view: true }));
  timeoutId = setTimeout(() => {
    dispatch(showBottomNotification({ text: "", view: false }));
  }, 4000);
};

export default bottomNotification;
