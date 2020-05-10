import React from 'react'
import $ from 'jquery'

export default function Home(props){
    $("#header_title").text('主页');
  return(
    <div>
      Welcome to DMLab Platfrom.
    </div>
  )
}
