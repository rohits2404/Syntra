import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import React from "react";

const Home = () => {
    return (
        <div>
            <h1>Home</h1>
            <Button>Click Me</Button>
            <ThemeToggle />
        </div>
    );
};

export default Home;
