"use client";
import ShopAccount from './ShopAccount';
import SupportDesk from './SupportDesk';
export default function SupportSession(){return <ShopAccount>{session=><SupportDesk key={session.user.id}/>}</ShopAccount>;}
