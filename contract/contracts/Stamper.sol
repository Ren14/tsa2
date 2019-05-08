// 20190401 Robert Martin-Legene <robert@nic.ar>
// Stamper
// vim:filetype=javascript

pragma solidity ^0.5.2;

contract Stamper {
    struct Stamp {
        bytes32 object;
        address stamper;
        uint256 blockNo;
    }
    Stamp[] stampList;

    // Mapping de objects stampeados a la stampList
    mapping ( bytes32 => uint256[] )  hashObjects;

    // Mapping de cuentas que stampean (stampers) a la stampList
    mapping ( address => uint256[] )  hashStampers;

    // Evento que se dispara al agregar un stamp
    event Stamped(
        address indexed from,
        bytes32 indexed object,
        uint256 blockNo
    );

    address owner;

    constructor() public {
        owner = msg.sender;

        // No queremos que haya stamps asociados a la posicion 0 (== false)
        // entonces guardamos ahi informacion de quien creo el SC y en que bloque
        stampList.push(Stamp(0, msg.sender, block.number));
    }

    // Stampear una lista de objects (hashes)
    function put( bytes32[] memory objectList ) public {
        uint256 i = 0;
        uint256 max = objectList.length;
        while ( i<max )
        {
            bytes32 h = objectList[i];
            // stampList.push devuelve la longitud, restamos 1 para usar como indice
            uint256 idx = stampList.push(Stamp(h, msg.sender, block.number)) - 1;
            hashObjects[h].push(idx);
            hashStampers[msg.sender].push(idx);

            emit Stamped(msg.sender, h, block.number);

            i++;
        }
    }

    // devuelve un stamp completo (object, stamper, blockno) de la lista
    function getStamplistPos( uint256 pos ) public view returns ( bytes32, address, uint256 )
    {
        return  (stampList[pos].object, stampList[pos].stamper, stampList[pos].blockNo );
    }

    // devuelve la cantidad de stamps que hay de este object
    function getObjectCount( bytes32 object ) public view returns (uint256)
    {
        return hashObjects[object].length;
    }

    // devuelve la ubicacion en la stampList de un stamp especifico de este object
    function getObjectPos( bytes32 object, uint256 pos ) public view returns (uint256)
    {
        return hashObjects[object][pos];
    }

    // devuelve el nro de bloque en el que stamper registro object. Si no fue stampeado devuelve 0
    function getBlockNo( bytes32 object, address stamper ) public view returns (uint256)
    {
        uint length = hashObjects[object].length;
        for (uint i = 0; i < length; i++) {
            Stamp memory current = stampList[hashObjects[object][i]];
            if (current.stamper == stamper) {
                return current.blockNo;
            }
        }

        return 0;
    }

    // devuelve la cantidad de stamps que realizo este stamper
    function getStamperCount( address stamper ) public view returns (uint256)
    {
        return hashStampers[stamper].length;
    }

    // devuelve la ubicacion en la sstamplist de un Stamp especifico de este stamper
    function getStamperPos( address stamper, uint256 pos ) public view returns (uint256)
    {
        return hashStampers[stamper][pos];
    }
}
