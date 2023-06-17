import { useEffect, useState } from "react";
import React from "react";

export const useContainerDimensions = (myRef: React.RefObject<HTMLElement>) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0, left: 0, top: 0 })

    useEffect(() => {
        const getDimensions = () => ({
            width: myRef?.current?.offsetWidth || 0,
            height: myRef?.current?.offsetHeight || 0,
            left: myRef?.current?.getBoundingClientRect().left || 0,
            top: myRef?.current?.getBoundingClientRect().top || 0,
        })

        const handleResize = () => {
            setDimensions(getDimensions())
        }

        if (myRef.current) {
            setDimensions(getDimensions())
        }

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [myRef])

    return dimensions;
};