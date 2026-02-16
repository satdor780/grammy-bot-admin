import { useState } from "react"
import { Button } from "../../shadcn/ui/button"
import { HeaderMenu } from "./components"
import { Separator } from "../../shadcn/ui/separator"
import { useTelegramStore } from "../../../store"

export const Header = () => {
    const [open, setOpen] = useState(false)
    const [activePage, setActivePage] = useState('Create Product')
    const user = useTelegramStore((s) => s.user);
    
    return (
        <>
        <div className="flex justify-between items-center py-4">
            <h1 className="font-bold text-[20px]">Mailzy</h1>
            <Button onClick={() => setOpen(true)} variant="outline" className="w-fit">
                Open Menu
            </Button>
            <HeaderMenu open={open} setOpen={setOpen} setActivePage={setActivePage} />
        </div>
        <Separator />
        <h1 className="text-2xl font-semibold tracking-tight py-2 flex justify-between items-center ">
            {activePage} <span>user: {user?.first_name}</span>
        </h1>
        </>
    )
}