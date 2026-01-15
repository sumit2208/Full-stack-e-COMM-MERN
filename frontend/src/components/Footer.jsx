import { Box, CardMedia, Divider, Typography } from '@mui/material'
import React from 'react'
import { FaInstagram } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { MdPhoneInTalk } from "react-icons/md";
const Footer = () => {
  return (
    < >
    <Box sx={{bgcolor:"#6457AE",}}>
      <Box sx={{ color:"white", display:"flex",justifyContent:"space-between",p:3}}>
        <Box  >
            <img
            src="https://imgs.search.brave.com/oRJV3015F2yEFmzyTocoxJsww8LqCgkGguagq0zwvc0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9keW5h/bWljLmJyYW5kY3Jv/d2QuY29tL2Fzc2V0/L2xvZ28vOTYwNTMy/YTUtYWI1MS00ZTlm/LThhYmItZjI1YmEy/ZDZhMzVkL2xvZ28t/c2VhcmNoLWdyaWQt/Mng_bG9nb1RlbXBs/YXRlVmVyc2lvbj0x/JnY9NjM4MzMyMjA5/NTQ2NTAwMDAwJmxh/eW91dD1hdXRvLTEt/MQ"
            style={{ height: "80px", width: "90px", margin: "0 auto" ,mixBlendMode:"color-burn"}}
            alt="Logo"
          /> 
        </Box>
        <Box sx={{display:"flex",  gap:"30px",p:2}}>
            <Box sx={{display:"flex",flexDirection:"column",gap:"30px"}}>
                <Typography sx={{color:'grey', fontWeight:800}}>CONTACT <MdPhoneInTalk style={{ color: "grey", fontSize: "21px" }}/></Typography>
                <Typography>9022445584</Typography>
            </Box>
            <Box sx={{display:"flex",flexDirection:"column",gap:"30px"}}>
                <Typography  sx={{color:'grey', fontWeight:800}}>FOLLOW US</Typography>
                <Typography>Instagram <FaInstagram/></Typography>
                <Typography>Facebook <FaFacebook/></Typography>
            </Box>
            <Box sx={{display:"flex",flexDirection:"column",gap:"30px",alignItems:"center"}}>
                <Typography  sx={{color:'grey', fontWeight:800}}>Email <MdEmail style={{ color: "grey", fontSize: "21px" }}/></Typography>
                <Typography>sg442754@gmail.com</Typography>
            </Box>
        </Box>
      </Box>
      <Divider sx={{ my: 2, borderColor: "#ffff", borderWidth: 2 }} />
      <Box sx={{display:"flex" , justifyContent:"space-between", p:3}}>
        <Typography variant='body2'>© 2023 E-STORE. All Rights Reserved.</Typography>
        <Typography variant='body2'>Disclaimer: This site is for practice purposes only. No actual products are being sold.</Typography>
      </Box>
      </Box>
    </>
  )
}

export default Footer
