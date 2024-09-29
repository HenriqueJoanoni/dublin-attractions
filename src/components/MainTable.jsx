import { Spinner, Table } from "react-bootstrap";

export const MainTable = ({locations = []}) => {
    return (
        <div>
            {locations.length <= 0 && (
                <Spinner className={"spinner-custom"} animation={"border"} variant={"primary"}/>
            )}
            {locations.length > 0 && (
                <Table striped bordered hover responsive>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Contact Number</th>
                        <th>Description</th>
                        <th>Image File Name</th>
                        <th>Last Update</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                    </tr>
                    </thead>
                    <tbody>
                    {locations.map(item => (
                        <tr key={item.poiID}>
                            <td>{item.poiID}</td>
                            <td>{item.name.trim()}</td>
                            <td>{item.address.trim()}</td>
                            <td>{item.contactNumber.trim() ? item.contactNumber.trim() : "N/A"}</td>
                            <td>{item.description.trim()}</td>
                            <td>{item.imageFileName.trim()}</td>
                            <td>{item.lastUpdate.trim()}</td>
                            <td>{item.latitude}</td>
                            <td>{item.longitude}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}
