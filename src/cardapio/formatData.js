/**
 * Formats the given cardapio data into a more readable format.
 *
 * @param {Object} cardapio - The cardapio data to be formatted.
 * @returns {Object} - The formatted cardapio data.
 */
async function formatData(rawData, next) {
    // Convert the raw data into a more readable format
    const cardapios = [];
    try {
        await rawData.map(cardapio => {

            let dia, data, almoco_nomeDaRefei, almoco_amo1, almoco_amo2, almoco_amo3, almoco_amo4, almoco_amo5, almoco_vegetariano, jantar_nomeDaRefei, jantar_jan1, jantar_jan2, jantar_jan3, jantar_jan4, jantar_jan5, jantar_vegetariano;

            dia = cardapio.dia[0];
            data = cardapio.dia[1];
            almoco_nomeDaRefei = cardapio.almoco[0];
            almoco_amo1 = cardapio.almoco[1] || '';
            almoco_amo2 = cardapio.almoco[2] || '';
            almoco_amo3 = cardapio.almoco[3] || '';
            almoco_amo4 = cardapio.almoco[4] || '';
            almoco_amo5 = cardapio.almoco[5] || '';
            almoco_vegetariano = cardapio.almoco[6] || '';
            jantar_nomeDaRefei = cardapio.jantar[0];
            jantar_jan1 = cardapio.jantar[1] || '';
            jantar_jan2 = cardapio.jantar[2] || '';
            jantar_jan3 = cardapio.jantar[3] || '';
            jantar_jan4 = cardapio.jantar[4] || '';
            jantar_jan5 = cardapio.jantar[5] || '';
            jantar_vegetariano = cardapio.jantar[6] || '';

            cardapios.push([
                dia,
                data,
                almoco_nomeDaRefei,
                almoco_amo1,
                almoco_amo2,
                almoco_amo3,
                almoco_amo4,
                almoco_amo5,
                almoco_vegetariano,
                jantar_nomeDaRefei,
                jantar_jan1,
                jantar_jan2,
                jantar_jan3,
                jantar_jan4,
                jantar_jan5,
                jantar_vegetariano
            ]);
        })
        return next(cardapios);
    } catch (error) {
        console.error(error);
        return next(false);
    }
}

module.exports = formatData;