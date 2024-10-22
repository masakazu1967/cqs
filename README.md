# CQS

コマンド・クエリ分離の原則(CQS)は、副作用を最小限に抑えるための設計原則です。[楽水 ソフトウェアの設計原則②コマンド・クエリ分離の原則（CQS）](https://rakusui.org/cqs/)
副作用を最小限に抑えることで、保守性と再利用性を高めるための設計原則です。
プログラミングにおける副作用とは、Wikipediaによると、関数から結果を受け取ることが主たる作用であり、それ以外のコンピュータの論理的状態(ローカル環境以外の状態変数の値)を変更させる作用を副作用と言います。

CQSではオブジェクトの状態を変更させるメソッドをコマンドと呼び、コマンドは値を返してはなりません。メソッドが何らかの値を戻すのであれば、そのメソッドはクエリであり、オブジェクトの状態を変更してはなりません。

最終的には読み込み用データストアと書き込み用のデータストアを分けるCQRSのアーキテクチャパターンに昇華されます。
データ書き込み時と読み込み時にSQL関数を特定のカラムに適用して書き込んだり読み込んだりする要件があります。
使用しているORMはTypeORMを使用しています。
Entityを保存するときにSQL関数を適用するのにクエリビルダーを使うことで実現可能であるという情報を得ました。

```ts
await getRepository(User).createQueryBuilder()
    .insert()
    .into(User)
    .values({
        name: 'John',
        createdAt: () => "NOW()",  // SQL関数を使用
    })
    .execute();
```

Entityを取得するときにSQL関数を適用した結果はEntityではなく生のレコードしか取得できません。

```ts
const users = await getRepository(User)
    .createQueryBuilder('user')
    .select([
        'user.id',
        'user.name',
        "TO_CHAR(user.createdAt, 'YYYY-MM-DD') as formattedDate" // SQL関数を適用
    ])
    .getRawMany();
```

TypeORMはSQL関数を直接エンティティにマッピングできるAPIを持たないため、カスタムSQLをそのままマッピングに使用するには一度生データを取得し、それを手動でエンティティにマッピングする必要があります。ただし、以下の方法でSQL関数の適用結果をエンティティに近い形で取得することは可能です。

```ts
import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
    SELECT
      id,
      name,
      TO_CHAR(createdAt, 'YYYY-MM-DD') as formattedDate
    FROM user
  `
})
export class UserView {
  @ViewColumn()
  id: number;

  @ViewColumn()
  name: string;

  @ViewColumn()
  formattedDate: string;
}
```

ドメインのエンティティに詰め替えるのであれば、TypeORMのEntityである必要はなく、生のレコードで構いません。

このように読み込みと書き込みでデータベースのエンティティが異なりますので、CQSをイメージしました。

画面に表示する一覧はViewEntityを使用し、ドメインエンティティを組み立てるためのクエリは生レコードを取得して、ドメインリポジトリの中でドメインエンティティに組み立てることを考えました。

NestJS v10を使用しています。

ドメイン用のリポジトリ。
ドメインの読み書きを行います。イベントソーシングとCQRSを組み合わせる場合は、コマンド側のイベントストアとクエリ側のリードモデルは異なるデータソースを使用しなくてはならないため、`userWriteModelRepository`と`userReadModelRepository`のデータソースは異なります。

```ts
@Injectable()
export class SqlUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserTable)
    private userWriteModelRepository: Repository<UserTable>,
    @InjectRepository(UserView)
    private userReadModelRepository: Repository<UserView>,
  ) {}

  async findById(id: UserId): Promise<User | null> {
    const record = await this.userReadModelRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        "TO_CHAR(user.createdAt, 'YYYY-MM-DD') AS createdAt",
      ])
      .where('user.id = :id', { id: id.value })
      .getRawMany();
    return record != null ? this.fromRecord(record) : null;
  }

  async save(domain: User): Promise<void> {
    const record = this.toRecord(domain);
    await this.userWriteModelRepository.save(record);
  }

private fromRecord(record: UserView): User {
    // UserViewからUserへ変換する。
  }

  private toRecord(domain: User): UserTable {
    // UserからUserTableへ変換する。
  }
}
```

ドメイン層のリポジトリでデータソースのエンティティを取得するのは、ドメイン層のビジネスルールや制約を解決するためのメソッドのみを定義します。
例えば、ドメインでは重複登録を抑止する必要がある場合、コードによる重複検証を行うために、`findByCode`のメソッドをドメインリポジトリに定義するのはアリです。

画面一覧などで使用するリポジトリはクエリサービスと名付けてドメインのリポジトリとは分けて管理をします。

```ts
@Injectable()
export class SqlUserQueryService implements UserQueryService {
  constructor(@InjectRepository(UserView) userRepository: Repository<UserView>) {}

  async find(condition: UserSearchCondition): Promise<ReadonlyArray<UserView>> {
    // conditionよりリポジトリ用の検索条件を組み立てる。
    return await this.userRepository.find(this.toRepositoryCondition(condition));
  }
}
```

`UserQueryService`インターフェイスはアプリケーション層に定義し、`SqlUserQueryService`はインフラストラクチャ層に定義します。

この考え方で実装ができるかコードを書いて検証を行います。
