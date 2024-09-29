export const SearchBar = ({searchQuery, onSearchChange}) => {
    return (
        <div className={"space-around"}>
            <form>
                <label htmlFor="searchLocation">Search By Name or Address</label>
                <input
                    className={"search-field box-shadow-custom"}
                    type="text"
                    placeholder={"Search..."}
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                />
            </form>
        </div>
    )
}
