// export default /(polonox|poloneix|poloium|polonniex|poloiexx|polonium|blocktrads|blocktrade|bittrexx|bittrexxx|bitrex|bitrexx)\b/;

const list = `
polonox
poloneix
bitterx
bittex
bittrax
bittre
bittres
bittrex.com
bittrexe
bittrexx
bittrez
bittrix
bittrx
bitttrex
bitrex
bitrexx
bitrix
bitrrex
bttrex
btrex
bttrex
poloiex
poloinex
polomiex
polon
poloneex
poloneix
polonex
poloni
poloniax
polonie
poloniec
poloniee
polonieex
poloniek
polonieks
polonies
poloniet
poloniets
poloniex.com
poloniexcold
poloniexe
poloniexs
poloniext
poloniexx
poloniey
poloniez
poloniiex
poloniix
poloniks
poloniox
polonium
polonix
polonniex
polooniex
pooniex
poooniex
blocktardes
blocktrade
bocktrades
changelly.com
changely
shapeshif
shapeshift
livecoin.net
`.trim().split('\n');

export default RegExp(`(` + list.join("|") + `)\\b`, "i");


