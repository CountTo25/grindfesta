//am i fucking doing serde in TS because
//i fucking hate how stupid saving/loading is? Fuck yeah i am
//Dont use it in production, if you for some reason decided to
//look for serde in TS in a fucking incremental game engine

export default {
  serialize: {
    sync: <T extends Serializeable>(data: T): string => {
      return data.serialize();
    },
  },
  deserialize: {
    sync: <T extends Deserializeable>(
      data: string,
      Type: DeserializeableConstructor<T>,
    ): T => {
      return new Type().deserialize(data);
    },
  },
};

export interface Serializeable {
  serialize(): string;
}

export interface Deserializeable {
  deserialize(data: string): this;
}

export type DeserializeableConstructor<T extends Deserializeable> = new () => T;
