/**
 * Checkbox component, used to render a checkbox input for group and individual checkboxes of cookie.
 * @param key
 * @param id
 * @param label
 * @param onChange
 * @param disabled
 * @returns {JSX.Element}
 * reference: https://marek-rozmus.medium.com/styling-checkbox-with-tailwind-46a92c157e2d
 */

const Checkbox = ({key, id, label, onChange, disabled = false}) => {
    return (
        <div className="w-full flex gap-4 justify-start items-center" key={key}>
            <input
                className="peer relative appearance-none shrink-0 w-5 h-5 border-2 border-blue-200 rounded-full mt-1 bg-white
                    focus:outline-none focus:ring-offset-0 focus:ring-1 focus:ring-blue-100
                    checked:bg-blue-300 checked:border-0
                    disabled:border-steel-400 disabled:bg-steel-400"
                type="checkbox"
                id={id}
                onChange={onChange}
            />
            <svg
                className="absolute w-5 h-5 pointer-events-none hidden peer-checked:block stroke-white mt-1 outline-none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <label htmlFor={id} className={"text-lg font-semibold"}>
                {label}
            </label>
        </div>
    );
}

export default Checkbox;