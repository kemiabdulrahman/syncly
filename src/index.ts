import express from "express"; const app = express(); app.get("/", (_,res)=>res.send("Hello, Express + TS!")); app.listen(3000,()=>console.log("🚀 Server running on 3000"));
