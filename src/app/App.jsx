import '../assets/scss/App.scss'
import { useEffect, useState } from "react";
import { MainTable, SearchBar, PageHeader } from "../components";
import { PageFooter } from "../components/PageFooter.jsx";

const App = () => {
    /** STATE FOR PARSING THE JSON FILE THE FIRST TIME */
    const [locations, setLocations] = useState([]);

    /** STATE FOR GETTING THE DATA FROM THE INPUT */
    const [searchQuery, setSearchQuery] = useState("")

    /** EFFECT TO FETCH AND SET THE DATA FROM JSON TO THE TABLE */
    useEffect(() => {
        fetch('walk-dublin-poi-details-sample-datap20130415-1449.json')
            .then(res => res.json())
            .then(data => {
                setLocations(data)
            })
    }, [])

    /** HANDLE SEARCH QUERY */
    const handleSearchChange = (query) => {
        setSearchQuery(query)
    }

    /** FILTER THE LOCATIONS AND SET INTO THE TABLE COMPONENT */
    const filteredLocations = locations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <>
            <PageHeader/>
            <SearchBar searchQuery={searchQuery} onSearchChange={handleSearchChange}/>
            <div className={"content-custom"}>
                <MainTable locations={filteredLocations}/>
            </div>
            <PageFooter/>
        </>
    )
}

export default App
