'use client'

export interface SideTabButtonProps {
    name: string; 
    onClickSideTabButton?: ()=> void;
    TabClicked: boolean;
    currentTab: string | null;
}

export default function SideTabButton(
    {
        name,
        onClickSideTabButton,
        TabClicked,
        currentTab,
    }: SideTabButtonProps
) {
    return (
        <button
        onClick={onClickSideTabButton}
        className={`text-center w-full px-3 py-2 flex justify-start  ${
            TabClicked && currentTab === name
            ? 'bg-sidetab-hover-click-color'
            : 'hover:bg-sidetab-hover-click-color bg-menuside-bar-background-color hover:text-white text-side-panel-text-color'}`}
        >
            {name}
        </button>
    )
}