export const isPhone = () => {
    if (/(iPhone|iPad|iPod|iOS|Android)/i.test(window.navigator.userAgent)) {
        //移动端
        return true;
    }
    return false;
};
