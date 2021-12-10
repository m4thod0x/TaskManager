FactoryBot.define do
  sequence :string, aliases: [:first_name, :last_name, :password, :avatar, :name, :description] do |n|
    "string#{n}"
  end

  sequence :email do |n|
    "person#{n}@example.com"
  end

  sequence (:type) { ['Developer', 'Manager', 'Admin'].sample }

  sequence (:expired_at) { Time.now }
end
