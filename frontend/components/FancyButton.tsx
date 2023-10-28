import { ReactNode, ButtonHTMLAttributes, useState } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    onClick?: () => void;
    colorFrom?: string;
    colorTo?: string;
}

export default function FancyButton({
    onClick,
    children,
    colorFrom,
    colorTo,
    ...buttonProps
}: Props) {
    colorFrom = colorFrom || "#3b82f6"; // blue-500
    colorTo = colorTo || "#a855f7"; // purple-500

    const [isHovered, setIsHovered] = useState(false);

    function handleClick() {
        onClick && onClick();
    }

    let styles: React.CSSProperties = {
        backgroundImage: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
    };
    if (isHovered) {
        styles.backgroundImage = "none";
        styles.color = colorFrom;
        styles.outlineColor = colorFrom;
    }

    return (
        <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={styles}
            className={`
                w-36 p-2 text-white rounded-lg font-semibold
                hover:outline-[2px] hover:outline active:scale-[85%] transition-transform`}
            {...buttonProps}
        >
            {children}
        </button>
    );
}
