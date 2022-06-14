import {u128, Context} from "near-sdk-core"
import {AccountId} from "../../utils"

const TEXT_EMPTY_ERR_MSG = "Text can't be empty",
    TEXT_TOO_LONG_ERR_MSG = "Text can't be longer than "+ Thought.maxLength().toString()

@nearBindgen
export class Thought {
    public static maxLength(): i32 {return 200 as i32}

    public thinker: AccountId
    public text: string

    constructor(text: string) {
        assert(text.length > 0, TEXT_EMPTY_ERR_MSG)
        assert(text.length <= Thought.maxLength(), TEXT_TOO_LONG_ERR_MSG)

        this.text = text
        this.thinker = Context.sender
    }
}

@nearBindgen
export class PiggyBank {
    public amount: u128

    constructor(){
        this.amount = u128.Zero
    }

    deposit(amount: u128): void { 
        this.amount = u128.add(this.amount, amount)
    }

    refresh(): void {
        this.amount = u128.Zero
    }
}
