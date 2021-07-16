export class Program {
    public static async main<T = any>(execute: () => Promise<T>) {
        let error: Error = null;

        try {
            console.log('----------------');
            await execute();
            console.log('DONE');
        } catch (err) {
            error = err;
        } finally {
            let errorCode = 0;
            if (error) {
                console.error('----- \n [!] Failed: ', error);
                errorCode = 1;
            }

            if (require.main === module) process.exit(errorCode);
        }
    }
}

// Program.main(async () => {});
