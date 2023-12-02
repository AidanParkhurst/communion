const express = require("express")
const app = express()

app.use(express.static("./index"))

app.listen(9999, () => {
    console.log("Listening on 9999")
})