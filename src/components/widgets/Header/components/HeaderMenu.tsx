import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../shadcn/ui/command";

const routes = [
  { name: "Create Product", path: "/create-product" },
  { name: "Promo codes", path: "/promo-codes" },
];

export function HeaderMenu({
  open,
  setOpen,
  setActivePage,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActivePage: React.Dispatch<React.SetStateAction<string>>;
}) {
  const navigate = useNavigate();

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {routes.map((route) => (
              <CommandItem
                key={route.path}
                onSelect={() => {
                  navigate(route.path);
                  setOpen(false);
                  setActivePage(route.name);
                }}
              >
                {route.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
