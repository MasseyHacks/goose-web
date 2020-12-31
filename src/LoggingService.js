export default {
    log() {
        let finalLog = [];
        for (let i = 0; i < arguments.length; i++) {
            finalLog.push(arguments[i]);
        }
        console.log(...finalLog)
    },
    debug() {
        if(process.env.NODE_ENV !== 'development'){
            return;
        }
        let finalLog = [];
        for (let i = 0; i < arguments.length; i++) {
            finalLog.push(arguments[i]);
        }
        console.log(...finalLog)
    }
}