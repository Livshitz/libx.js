export type ID = string;

export class ObjectId {
    public static new(timestamp = new Date().getTime(), randomize = false) {
        var timestampHex = ((timestamp / 1000) | 0).toString(16);
        return (
            timestampHex +
            'xxxxxxxxxxxxxxxx'
                .replace(/[x]/g, () => {
                    return randomize ? ((Math.random() * 16) | 0).toString(16) : '0';
                })
                .toLowerCase()
        );
    }

    public static toDate(id: ID) {
        return new Date(parseInt(id.substring(0, 8), 16) * 1000);
    }
}
